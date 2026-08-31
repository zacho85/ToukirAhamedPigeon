import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import cookieParser from 'cookie-parser';
import { join } from 'path';
import { NestExpressApplication } from '@nestjs/platform-express';
import { stripeRawBodyMiddleware } from './middleware/stripe-raw-body.middleware';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';
import { LoggingInterceptor } from './common/interceptors/logging.interceptor';
import { setupSwagger, shouldEnableSwagger } from './swagger/setup-swagger';
import * as bodyParser from 'body-parser';

/**
 * Origins allowed to call this API from a browser.
 * Driven by CORS_ORIGINS (comma-separated) so sandbox/staging can differ from
 * production without a code change. Falls back to the production allowlist.
 */
function resolveCorsOrigins(): string[] {
  const configured = process.env.CORS_ORIGINS;
  if (configured) {
    return configured
      .split(',')
      .map((origin) => origin.trim())
      .filter(Boolean);
  }
  return [
    'https://kongossapay.com',
    'https://www.kongossapay.com',
    // Agent app hosting moved from a agent.kongossapay.com subdomain to its
    // own purchased domain -- see nginx.conf's matching server block.
    'https://kongossapayagent.com',
    'https://www.kongossapayagent.com',
    'http://localhost:5173',
    'http://localhost:4000',
  ];
}

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  const corsOrigins = resolveCorsOrigins();

  // ⚡ Stripe webhook raw body middleware (must be BEFORE body-parser)
  app.use('/stripe/webhook', stripeRawBodyMiddleware());
  app.use('/stripe/payment-links/webhook', stripeRawBodyMiddleware());

  // ⚡ Normal JSON parsing with increased limits for file uploads
  app.use(bodyParser.json({ limit: '100mb' }));
  app.use(bodyParser.urlencoded({ limit: '100mb', extended: true }));

  // ✅ Static assets for uploaded files (make uploads folder accessible)
  app.useStaticAssets(join(process.cwd(), 'uploads'), {
    prefix: '/uploads/',
    setHeaders: (res, path, stat) => {
      // Allow cross-origin access to uploaded files.
      // Uses the first configured origin so sandbox serves its own host.
      res.setHeader('Access-Control-Allow-Origin', corsOrigins[0]);
    },
  });

  // Global validation
  app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));

  // Filters & interceptors
  app.useGlobalFilters(new HttpExceptionFilter());
  app.useGlobalInterceptors(new LoggingInterceptor());

  // Cookies
  app.use(cookieParser());

  // ✅ CORS
  // Outside production, also allow any http://localhost:<port> -- multiple
  // local dev servers (backend, kongossa-pay-ts, kongossa-agent-app, and
  // whatever else is already running) compete for 5173+ and Vite silently
  // moves to the next free port, so a fixed allowlist entry breaks the moment
  // a second/third app is running locally at once. Production still only
  // honours the explicit list (CORS_ORIGINS or the hardcoded fallback above).
  const isProduction = process.env.NODE_ENV === 'production';
  app.enableCors({
    origin: (origin, callback) => {
      if (!origin) return callback(null, true); // same-origin / curl / server-to-server
      if (corsOrigins.includes(origin)) return callback(null, true);
      if (!isProduction && /^http:\/\/localhost:\d+$/.test(origin)) {
        return callback(null, true);
      }
      callback(new Error(`Origin ${origin} not allowed by CORS`), false);
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Stripe-Signature', 'X-Requested-With'],
    exposedHeaders: ['Content-Length', 'Content-Type'],
  });

  // ✅ Swagger — sandbox/staging only, never production.
  // Protected at the edge by nginx Basic auth, not by this process.
  if (shouldEnableSwagger()) {
    setupSwagger(app);
    console.log('📘 Swagger UI mounted at /api-docs (spec at /api-docs-json)');
  }

  // Honour PORT — docker-compose already passes it, and it lets a second
  // instance run alongside a dev server for verification.
  const port = Number(process.env.PORT) || 3000;
  await app.listen(port);
  console.log(`🚀 Application running on: ${await app.getUrl()}`);
}
bootstrap();
