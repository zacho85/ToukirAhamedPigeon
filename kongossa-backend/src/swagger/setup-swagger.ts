import { INestApplication } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

/**
 * Mounts the OpenAPI document and Swagger UI.
 *
 * This is NOT self-protecting. Access control lives at the edge (nginx HTTP
 * Basic auth on /api-docs and /api-docs-json). A browser cannot attach an
 * Authorization header to an address-bar navigation, which is why the previous
 * in-app JWT gate could never work.
 *
 * Only call this when both conditions in main.ts hold — see `shouldEnableSwagger`.
 */
export function setupSwagger(app: INestApplication): void {
  const builder = new DocumentBuilder()
    .setTitle('Kongossa Pay API')
    .setDescription(
      'REST API for the Kongossa Pay platform: wallets, transfers, QR payments, ' +
        'payment links, tontines and budgeting.\n\n' +
        'Authenticate with `POST /auth/login`, then `POST /auth/send-otp` and ' +
        '`POST /auth/verify-otp` — the access token is only issued at the last step. ' +
        'Pass it as `Authorization: Bearer <token>`.',
    )
    .setVersion('1.0')
    .addBearerAuth(
      { type: 'http', scheme: 'bearer', bearerFormat: 'JWT' },
      'bearer',
    );

  // Advertise the environment's own base URL so "Try it out" targets the right host.
  const publicUrl = process.env.PUBLIC_API_URL;
  if (publicUrl) {
    builder.addServer(publicUrl);
  }

  const document = SwaggerModule.createDocument(app, builder.build());

  SwaggerModule.setup('api-docs', app, document, {
    jsonDocumentUrl: 'api-docs-json',
    swaggerOptions: {
      persistAuthorization: true,
      tagsSorter: 'alpha',
      operationsSorter: 'alpha',
    },
  });
}

/**
 * Swagger is exposed only when explicitly switched on AND the app is not
 * running as production. Two independent conditions, so a single stray
 * environment variable cannot expose the spec in production.
 */
export function shouldEnableSwagger(): boolean {
  return (
    process.env.ENABLE_SWAGGER === 'true' &&
    process.env.APP_ENV !== 'production'
  );
}
