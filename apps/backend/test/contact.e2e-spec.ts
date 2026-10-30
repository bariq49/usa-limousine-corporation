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
import { authEmailServiceMock, emailQueueLifecycleMock } from "./helpers/email-mocks";
import { registerAndVerifyEmail } from "./helpers/register-and-verify";

const basePath = `/${API_PREFIX}/v${API_VERSION}`;

type Mail = { to: string; replyTo?: string; subject: string; html: string };

describe("Contact (e2e)", () => {
  let app: INestApplication;
  let prisma: PrismaService;
  const sendMail = jest.fn(async (_mail: Mail) => undefined);

  const mails = () => sendMail.mock.calls.map((call) => call[0]);

  const waitForMails = async (count: number) => {
    for (let attempt = 0; attempt < 100 && sendMail.mock.calls.length < count; attempt += 1) {
      await new Promise((resolve) => setTimeout(resolve, 50));
    }
  };

  const cleanup = async () => {
    await prisma.notification.deleteMany();
    await prisma.helpTicket.deleteMany();
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

  beforeEach(async () => {
    await cleanup();
    sendMail.mockClear();
  });

  afterAll(async () => {
    await cleanup();
    await app.close();
  });

  async function adminToken(): Promise<string> {
    const email = `contact-admin-${Date.now()}@example.com`;
    await registerAndVerifyEmail({ app, prisma, email });
    const user = await prisma.user.findUniqueOrThrow({ where: { email } });
    const role = await prisma.role.findUniqueOrThrow({ where: { key: RoleKey.SUPER_ADMIN } });
    await prisma.userRole.create({ data: { userId: user.id, roleId: role.id } });
    const response = await request(app.getHttpServer())
      .post(`${basePath}/auth/login`)
      .set("x-device-id", "contact-e2e")
      .send({ email, password: "Password123!" })
      .expect(200);
    return response.body.data.accessToken as string;
  }

  it("turns a contact message into a ticket and emails both sides through its lifecycle", async () => {
    const server = app.getHttpServer();
    const auth = { Authorization: `Bearer ${await adminToken()}` };
    sendMail.mockClear();

    const submitted = await request(server)
      .post(`${basePath}/public/contact`)
      .send({
        firstName: "Grace",
        lastName: "Hopper",
        email: "Grace@Example.com",
        phone: "+17325550123",
        subject: "Pickup tonight",
        message: "My driver is <late>, please call me.",
        category: "BOOKING",
      })
      .expect(201);
    const ticketNumber = submitted.body.data.ticketNumber as string;
    expect(ticketNumber).toMatch(/^HC-/);

    const ticket = await prisma.helpTicket.findUniqueOrThrow({ where: { ticketNumber } });
    expect(ticket).toEqual(
      expect.objectContaining({
        source: "WEBSITE",
        customerId: null,
        contactName: "Grace Hopper",
        contactEmail: "grace@example.com",
        contactPhone: "+17325550123",
        priority: "HIGH",
        category: "BOOKING",
        status: "PENDING",
      }),
    );

    const adminNotifications = await prisma.notification.count({
      where: { type: "TICKET_CREATED" },
    });
    expect(adminNotifications).toBeGreaterThan(0);

    await waitForMails(2);
    const customerMail = mails().find((mail) => mail.to === "grace@example.com");
    const adminMail = mails().find((mail) => mail.to === process.env["DEFAULT_ADMIN_EMAIL"]);
    expect(customerMail?.subject).toContain(`We received your message · ${ticketNumber}`);
    expect(adminMail?.subject).toContain("[HIGH PRIORITY]");
    expect(adminMail?.replyTo).toBe("grace@example.com");
    expect(adminMail?.html).not.toContain("/help-center/");
    expect(adminMail?.html).toContain("My driver is &lt;late&gt;");

    const listed = await request(server)
      .get(`${basePath}/admin/tickets`)
      .query({ source: "WEBSITE", search: "grace" })
      .set(auth)
      .expect(200);
    expect(listed.body.data.data).toHaveLength(1);

    sendMail.mockClear();
    await request(server)
      .post(`${basePath}/admin/tickets/${ticket.id}/messages`)
      .set(auth)
      .send({ body: "Your driver is two minutes away." })
      .expect(201);
    await waitForMails(1);
    expect(mails()[0]?.to).toBe("grace@example.com");
    expect(mails()[0]?.subject).toContain(`Reply to your request · ${ticketNumber}`);
    expect(mails()[0]?.html).toContain("Your driver is two minutes away.");

    sendMail.mockClear();
    await request(server)
      .patch(`${basePath}/admin/tickets/${ticket.id}/status`)
      .set(auth)
      .send({ status: "IN_PROGRESS" })
      .expect(200);
    await request(server)
      .patch(`${basePath}/admin/tickets/${ticket.id}/status`)
      .set(auth)
      .send({ status: "RESOLVED", note: "Ride completed." })
      .expect(200);
    await new Promise((resolve) => setTimeout(resolve, 500));
    expect(mails()).toHaveLength(0);
  });

  it("links a known customer, alerts when priority is raised and ignores bots", async () => {
    const server = app.getHttpServer();
    const auth = { Authorization: `Bearer ${await adminToken()}` };
    const customerEmail = `known-${Date.now()}@example.com`;
    await registerAndVerifyEmail({ app, prisma, email: customerEmail });
    sendMail.mockClear();

    const submitted = await request(server)
      .post(`${basePath}/public/contact`)
      .send({
        firstName: "Known",
        email: customerEmail,
        subject: "Invoice question",
        message: "Can I get a copy of my invoice?",
      })
      .expect(201);
    const ticket = await prisma.helpTicket.findUniqueOrThrow({
      where: { ticketNumber: submitted.body.data.ticketNumber as string },
      include: { customer: { include: { user: true } } },
    });
    expect(ticket.customer?.user.email).toBe(customerEmail);
    const firstMessage = await prisma.helpTicketMessage.findFirstOrThrow({
      where: { ticketId: ticket.id },
    });
    expect(firstMessage.authorUserId).toBe(ticket.customer?.userId);
    expect(ticket.priority).toBe("HIGH");
    await waitForMails(2);

    await request(server)
      .patch(`${basePath}/admin/tickets/${ticket.id}/priority`)
      .set(auth)
      .send({ priority: "MEDIUM" })
      .expect(200);
    await new Promise((resolve) => setTimeout(resolve, 300));
    sendMail.mockClear();
    await request(server)
      .patch(`${basePath}/admin/tickets/${ticket.id}/priority`)
      .set(auth)
      .send({ priority: "HIGH" })
      .expect(200);
    await waitForMails(1);
    expect(mails()[0]?.to).toBe(process.env["DEFAULT_ADMIN_EMAIL"]);
    expect(mails()[0]?.subject).toContain(`[HIGH PRIORITY] Ticket ${ticket.ticketNumber}`);

    const before = await prisma.helpTicket.count();
    const bot = await request(server)
      .post(`${basePath}/public/contact`)
      .send({
        firstName: "Bot",
        email: "bot@example.com",
        subject: "Buy now",
        message: "Cheap followers here",
        website: "https://spam.example",
      })
      .expect(201);
    expect(bot.body.data.ticketNumber).toBeNull();
    expect(await prisma.helpTicket.count()).toBe(before);

    await request(server)
      .post(`${basePath}/public/contact`)
      .send({ firstName: "", email: "not-an-email", subject: "x", message: "y" })
      .expect(400);
  });
});
