import { type INestApplication } from "@nestjs/common";
import { Test, type TestingModule } from "@nestjs/testing";
import { RoleKey } from "@prisma/client";
import request from "supertest";
import { AppModule } from "../src/app.module";
import { configureApp } from "../src/bootstrap/configure-app";
import { API_PREFIX, API_VERSION } from "../src/config/api.constants";
import { PrismaService } from "../src/infrastructure/database/prisma.service";
import { EmailService } from "../src/infrastructure/email/email.service";
import { AuthEmailService } from "../src/modules/auth/services/auth-email.service";
import { AuthEmailQueueService } from "../src/modules/auth/jobs/auth-email-queue.service";
import { BlogService } from "../src/modules/blogs/services/blog.service";
import { authEmailServiceMock, emailQueueLifecycleMock } from "./helpers/email-mocks";
import { registerAndVerifyEmail } from "./helpers/register-and-verify";

const basePath = `/${API_PREFIX}/v${API_VERSION}`;

describe("Blogs (e2e)", () => {
  let app: INestApplication;
  let prisma: PrismaService;
  const sendMail = jest.fn(async () => undefined);

  const cleanup = async () => {
    await prisma.blogComment.deleteMany();
    await prisma.blogPostTag.deleteMany();
    await prisma.blog.deleteMany();
    await prisma.blogTag.deleteMany();
    await prisma.blogCategory.deleteMany();
    await prisma.auditLog.deleteMany();
    await prisma.session.deleteMany();
    await prisma.userRole.deleteMany();
    await prisma.user.deleteMany();
  };

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideProvider(AuthEmailService)
      .useValue(authEmailServiceMock)
      .overrideProvider(AuthEmailQueueService)
      .useValue(emailQueueLifecycleMock)
      .overrideProvider(EmailService)
      .useValue({ send: sendMail })
      .compile();

    app = moduleFixture.createNestApplication();
    configureApp(app);
    await app.init();
    prisma = app.get(PrismaService);
  });

  beforeEach(cleanup);

  afterAll(async () => {
    await cleanup();
    await app.close();
  });

  async function adminToken(): Promise<string> {
    const email = `blog-admin-${Date.now()}@example.com`;
    await registerAndVerifyEmail({ app, prisma, email });
    const user = await prisma.user.findUniqueOrThrow({ where: { email } });
    const role = await prisma.role.findUniqueOrThrow({ where: { key: RoleKey.SUPER_ADMIN } });
    await prisma.userRole.create({ data: { userId: user.id, roleId: role.id } });
    const response = await request(app.getHttpServer())
      .post(`${basePath}/auth/login`)
      .set("x-device-id", "blogs-e2e")
      .send({ email, password: "Password123!" })
      .expect(200);
    return response.body.data.accessToken as string;
  }

  it("publishes, schedules and moderates articles", async () => {
    const auth = { Authorization: `Bearer ${await adminToken()}` };
    const server = app.getHttpServer();

    const category = await request(server)
      .post(`${basePath}/admin/blog-categories`)
      .set(auth)
      .send({ name: "Airport Travel" })
      .expect(201);
    expect(category.body.data.slug).toBe("airport-travel");

    const tag = await request(server)
      .post(`${basePath}/admin/blog-tags`)
      .set(auth)
      .send({ name: "JFK" })
      .expect(201);

    const published = await request(server)
      .post(`${basePath}/admin/blogs`)
      .set(auth)
      .send({
        title: "Getting to JFK on Time",
        content: '<p>Plan ahead.</p><script>alert(1)</script><a href="javascript:alert(1)">x</a>',
        categoryId: category.body.data.id,
        tagIds: [tag.body.data.id],
        status: "PUBLISHED",
        isFeatured: true,
      })
      .expect(201);
    expect(published.body.data.slug).toBe("getting-to-jfk-on-time");
    expect(published.body.data.content).not.toContain("script");
    expect(published.body.data.content).not.toContain("javascript:");
    expect(published.body.data.publishedAt).toBeTruthy();

    const duplicate = await request(server)
      .post(`${basePath}/admin/blogs`)
      .set(auth)
      .send({
        title: "Getting to JFK on Time",
        content: "<p>Draft</p>",
        categoryId: category.body.data.id,
      })
      .expect(201);
    expect(duplicate.body.data.slug).toBe("getting-to-jfk-on-time-2");
    expect(duplicate.body.data.status).toBe("DRAFT");

    await request(server)
      .post(`${basePath}/admin/blogs`)
      .set(auth)
      .send({
        title: "Past schedule",
        content: "<p>x</p>",
        categoryId: category.body.data.id,
        status: "SCHEDULED",
        scheduledDate: "2020-01-01",
        scheduledTime: "09:00",
      })
      .expect(400);

    const scheduled = await request(server)
      .post(`${basePath}/admin/blogs`)
      .set(auth)
      .send({
        title: "Coming soon",
        content: "<p>Soon</p>",
        categoryId: category.body.data.id,
        status: "SCHEDULED",
        scheduledDate: `${new Date().getFullYear() + 1}-01-15`,
        scheduledTime: "10:00",
      })
      .expect(201);
    expect(scheduled.body.data.status).toBe("SCHEDULED");

    const list = await request(server).get(`${basePath}/public/blogs`).expect(200);
    expect(list.body.data.data.map((item: { slug: string }) => item.slug)).toEqual([
      "getting-to-jfk-on-time",
    ]);
    expect(list.body.data.data[0].content).toBeUndefined();

    const byTag = await request(server)
      .get(`${basePath}/public/blogs`)
      .query({ tag: "jfk" })
      .expect(200);
    expect(byTag.body.data.data).toHaveLength(1);

    const featured = await request(server).get(`${basePath}/public/blogs/featured`).expect(200);
    expect(featured.body.data).toHaveLength(1);

    await request(server).get(`${basePath}/public/blogs/getting-to-jfk-on-time-2`).expect(404);
    await request(server).get(`${basePath}/public/blogs/coming-soon`).expect(404);

    await prisma.blog.update({
      where: { id: scheduled.body.data.id },
      data: { publishedAt: new Date(Date.now() - 1000) },
    });
    await request(server).get(`${basePath}/public/blogs/coming-soon`).expect(200);
    expect(await app.get(BlogService).publishDue()).toBe(1);

    const detail = await request(server)
      .get(`${basePath}/public/blogs/getting-to-jfk-on-time`)
      .expect(200);
    expect(detail.body.data.tags[0].tag.slug).toBe("jfk");

    const views = await request(server)
      .post(`${basePath}/public/blogs/getting-to-jfk-on-time/views`)
      .expect(200);
    expect(views.body.data.viewCount).toBe(1);

    const comment = await request(server)
      .post(`${basePath}/public/blogs/getting-to-jfk-on-time/comments`)
      .send({ fullName: "Ada Rider", email: "Ada@Example.com", content: "Very <b>helpful</b>!" })
      .expect(201);
    expect(comment.body.data.status).toBe("PENDING");

    for (let attempt = 0; attempt < 40 && sendMail.mock.calls.length === 0; attempt += 1) {
      await new Promise((resolve) => setTimeout(resolve, 50));
    }
    const [mail] = sendMail.mock.calls[0] as unknown as [
      { to: string; replyTo: string; subject: string; html: string },
    ];
    expect(mail.to).toBe(process.env["DEFAULT_ADMIN_EMAIL"]);
    expect(mail.replyTo).toBe("ada@example.com");
    expect(mail.subject).toContain("Getting to JFK on Time");
    expect(mail.html).toContain("/blog-comments");
    expect(mail.html).toContain("/blog/getting-to-jfk-on-time");
    expect(mail.html).toContain("Very helpful!");

    const hidden = await request(server)
      .get(`${basePath}/public/blogs/getting-to-jfk-on-time/comments`)
      .expect(200);
    expect(hidden.body.data.total).toBe(0);

    await request(server)
      .patch(`${basePath}/admin/blog-comments/${comment.body.data.id}`)
      .set(auth)
      .send({ status: "APPROVED" })
      .expect(200);

    const shown = await request(server)
      .get(`${basePath}/public/blogs/getting-to-jfk-on-time/comments`)
      .expect(200);
    expect(shown.body.data.data[0]).toEqual(
      expect.objectContaining({ fullName: "Ada Rider", content: "Very helpful!" }),
    );
    expect(shown.body.data.data[0].email).toBeUndefined();

    const categories = await request(server).get(`${basePath}/public/blog-categories`).expect(200);
    expect(categories.body.data[0]._count.blogs).toBe(2);

    await request(server)
      .delete(`${basePath}/admin/blog-categories/${category.body.data.id}`)
      .set(auth)
      .expect(409);

    await request(server)
      .patch(`${basePath}/admin/blog-categories/${category.body.data.id}`)
      .set(auth)
      .send({ isActive: false })
      .expect(200);
    const afterHide = await request(server).get(`${basePath}/public/blogs`).expect(200);
    expect(afterHide.body.data.data).toHaveLength(0);
  });
});
