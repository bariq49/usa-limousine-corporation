import { type INestApplication } from "@nestjs/common";
import * as argon2 from "argon2";
import request from "supertest";
import { API_PREFIX, API_VERSION } from "../../src/config/api.constants";
import { type PrismaService } from "../../src/infrastructure/database/prisma.service";

const basePath = `/${API_PREFIX}/v${API_VERSION}`;

/** Known password used by e2e suites after approval (approve issues a random one). */
export const APPROVED_DRIVER_PASSWORD = "Password123!";

function phoneFromEmail(email: string): string {
  let n = 0;
  for (let i = 0; i < email.length; i += 1) {
    n = (n + email.charCodeAt(i) * (i + 1)) % 100_000_000;
  }
  return `+316${n.toString().padStart(8, "0")}`;
}

export async function createApprovedOrgDriver(
  app: INestApplication,
  prisma: PrismaService,
  params: {
    adminAccessToken: string;
    email: string;
    firstName?: string;
    lastName?: string;
    phone?: string;
    password?: string;
  },
): Promise<{ id: string; userId: string; applicationNumber: string; password: string }> {
  const password = params.password ?? APPROVED_DRIVER_PASSWORD;

  const created = await request(app.getHttpServer())
    .post(`${basePath}/drivers`)
    .send({
      email: params.email,
      firstName: params.firstName ?? "Jane",
      lastName: params.lastName ?? "Driver",
      phone: params.phone ?? phoneFromEmail(params.email),
    })
    .expect(201);

  const driverId = created.body.data.id as string;

  await prisma.user.update({
    where: { email: params.email.toLowerCase() },
    data: { isEmailVerified: true },
  });

  await request(app.getHttpServer())
    .post(`${basePath}/admin/drivers/${driverId}/under-review`)
    .set("Authorization", `Bearer ${params.adminAccessToken}`)
    .expect(201);

  const approved = await request(app.getHttpServer())
    .post(`${basePath}/admin/drivers/${driverId}/approve`)
    .set("Authorization", `Bearer ${params.adminAccessToken}`)
    .expect(201);

  const userId = approved.body.data.userId as string;

  // Approve rotates to a random login password; pin a known one for e2e login.
  await prisma.user.update({
    where: { id: userId },
    data: {
      passwordHash: await argon2.hash(password),
      failedLoginCount: 0,
      lockoutUntil: null,
    },
  });

  return {
    id: approved.body.data.id as string,
    userId,
    applicationNumber: approved.body.data.applicationNumber as string,
    password,
  };
}
