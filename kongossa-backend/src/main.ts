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
import * as bodyParser from 'body-parser';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  // ⚡ Stripe webhook raw body middleware (must be BEFORE body-parser)
  app.use('/stripe/webhook', stripeRawBodyMiddleware());

  // ⚡ Normal JSON parsing with increased limits for file uploads
  app.use(bodyParser.json({ limit: '100mb' }));
  app.use(bodyParser.urlencoded({ limit: '100mb', extended: true }));

  // ✅ Static assets for uploaded files (make uploads folder accessible)
  app.useStaticAssets(join(process.cwd(), 'uploads'), { 
    prefix: '/uploads/',
    setHeaders: (res, path, stat) => {
      // Allow cross-origin access to uploaded files
      res.setHeader('Access-Control-Allow-Origin', 'https://kongossapay.com');
    },
  });

  // Global validation
  app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));

  // Filters & interceptors
  app.useGlobalFilters(new HttpExceptionFilter());
  app.useGlobalInterceptors(new LoggingInterceptor());

  // Cookies
  app.use(cookieParser());

  // ✅ CORS - Allow your production domain
  app.enableCors({
    origin: ['https://kongossapay.com', 'https://www.kongossapay.com', 'http://localhost:5173', 'http://localhost:4000'],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Stripe-Signature', 'X-Requested-With'],
    exposedHeaders: ['Content-Length', 'Content-Type'],
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