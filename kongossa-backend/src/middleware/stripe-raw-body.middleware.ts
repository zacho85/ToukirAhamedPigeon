// middleware/stripe-raw-body.middleware.ts
import { Request, Response, NextFunction } from 'express';
import { json } from 'body-parser';

export function stripeRawBodyMiddleware() {
  return (req: Request, res: Response, next: NextFunction) => {
    json({
      verify: (req, _res, buf: Buffer) => {
        // Attach raw body buffer to req
        (req as any).rawBody = buf;
      },
    })(req, res, next);
  };
}
