import { type INestApplication } from "@nestjs/common";
import { DocumentBuilder, SwaggerModule } from "@nestjs/swagger";
import { API_PREFIX, APP_NAME, API_VERSION, SWAGGER_PATH } from "../config/api.constants";

export function setupSwagger(app: INestApplication): void {
  const document = SwaggerModule.createDocument(
    app,
    new DocumentBuilder()
      .setTitle(APP_NAME)
      .setDescription("USA Limousine Corporation platform API")
      .setVersion(`${API_VERSION}.0`)
      .build(),
  );

  SwaggerModule.setup(`${API_PREFIX}/${SWAGGER_PATH}`, app, document, {
    swaggerOptions: {
      persistAuthorization: true,
    },
  });
}
