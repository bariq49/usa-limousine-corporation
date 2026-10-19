import type { INestApplication } from "@nestjs/common";
import request from "supertest";
import { API_PREFIX, API_VERSION } from "../../src/config/api.constants";
import type { PrismaService } from "../../src/infrastructure/database/prisma.service";

const basePath = `/${API_PREFIX}/v${API_VERSION}`;

export async function registerAndVerifyEmail(params: {
  app: INestApplication;
  prisma: PrismaService;
  email: string;
  password?: string;
}): Promise<void> {
  const { app, prisma, email } = params;
  const password = params.password ?? "Password123!";

  await request(app.getHttpServer())
    .post(`${basePath}/auth/register`)
    .send({ email, password })
    .expect(201);

  await prisma.user.update({
    where: { email },
    data: { isEmailVerified: true },
  });
}
