import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from '@nestjs/common';
import * as Sentry from '@sentry/node';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';

@Injectable()
export class SentryInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const req = context.switchToHttp().getRequest();

    const transaction = Sentry.startTransaction({
      op: 'http_request',
      name: `${req.method} ${req.originalUrl}`,
    });

    Sentry.configureScope((scope) => {
      scope.setSpan(transaction);
    });

    return next.handle().pipe(
      tap({
        next: () => {
          transaction.finish();
        },
        error: (error) => {
          Sentry.captureException(error);
          transaction.finish();
        },
      }),
    );
  }
}