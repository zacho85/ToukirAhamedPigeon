import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import cookieParser from 'cookie-parser';
import { join } from 'path';
import { NestExpressApplication } from '@nestjs/platform-express';
import { stripeRawBodyMiddleware } from './middleware/stripe-raw-body.middleware';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';
import { LoggingInterceptor } from './common/interceptors/logging.interceptor';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  // ⚡ Stripe webhook raw body middleware
  app.use('/stripe/webhook', stripeRawBodyMiddleware());

  // ⚡ Normal JSON parsing for other routes
  app.use(require('body-parser').json());
  app.use(require('body-parser').urlencoded({ extended: true }));

  // Static assets
  app.useStaticAssets(join(process.cwd(), 'uploads'), { prefix: '/uploads/' });

  // Global validation
  app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));

  // Filters & interceptors
  app.useGlobalFilters(new HttpExceptionFilter());
  app.useGlobalInterceptors(new LoggingInterceptor());

  // Cookies
  app.use(cookieParser());

  // CORS
  app.enableCors({
    origin: ['http://localhost:5173', 'http://localhost:4000', 'http://localhost:3000'],
    credentials: true,
    allowedHeaders: ['Content-Type','Authorization','Stripe-Signature'],
  });

  // Swagger
  const config = new DocumentBuilder()
    .setTitle('Kongossa API')
    .setDescription('API docs')
    .setVersion('1.0')
    .addBearerAuth()
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api-docs', app, document);

  await app.listen(3000);
  console.log(`🚀 Application running on: ${await app.getUrl()}`);
}
bootstrap();
