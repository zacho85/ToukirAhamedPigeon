import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
} from '@nestjs/common';

/**
 * Global HTTP Exception Filter to handle all uncaught exceptions.
 * Converts exceptions to a standard JSON response format.
 */
@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse();
    const request = ctx.getRequest();

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let message = 'Internal server error';

    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const body = exception.getResponse();
      // getResponse() returns a plain string for a simple
      // `new SomeException('message')`, but an object for anything NestJS
      // builds itself -- ValidationPipe failures in particular return
      // { statusCode, message: string[], error }. The previous `as string`
      // was a type-cast, not a conversion: it silently nested that whole
      // object into this response's own `message` field, which the
      // frontend then tried to render directly, crashing with "Objects are
      // not valid as a React child" the first time a validation error
      // actually got exercised end-to-end.
      if (typeof body === 'string') {
        message = body;
      } else if (body && typeof body === 'object' && 'message' in body) {
        const inner = (body as { message: unknown }).message;
        message = Array.isArray(inner) ? inner.join(', ') : String(inner);
      } else {
        message = exception.message;
      }
    }

    response.status(status).json({
      statusCode: status,
      timestamp: new Date().toISOString(),
      path: request.url,
      message,
    });
  }
}
