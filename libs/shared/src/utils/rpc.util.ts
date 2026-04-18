import { ClientProxy } from '@nestjs/microservices';
import {
  HttpException,
  InternalServerErrorException,
  RequestTimeoutException,
} from '@nestjs/common';
import { lastValueFrom, TimeoutError, throwError } from 'rxjs';
import { catchError, timeout } from 'rxjs/operators';

export async function sendAndCatch<TResult = any, TInput = any>(
  client: ClientProxy,
  pattern: any,
  data: TInput,
  defaultValue?: TResult,
): Promise<TResult> {
  // eslint-disable-next-line @typescript-eslint/no-unsafe-return
  return lastValueFrom(
    client.send<TResult, TInput>(pattern, data).pipe(
      timeout(5000),
      catchError((error) => {
        if (error instanceof TimeoutError) {
          return throwError(
            () =>
              new RequestTimeoutException(
                'Service is currently unavailable. Please try again later.',
              ),
          );
        }
        if (error?.status && error?.message) {
          let statusResult = error.status;
          if (typeof statusResult === 'string') {
            const parsed = parseInt(statusResult, 10);
            statusResult = isNaN(parsed) ? 500 : parsed;
          } else if (typeof statusResult !== 'number') {
            statusResult = 500;
          }
          return throwError(
            () => new HttpException(error.message, statusResult as number),
          );
        }
        return throwError(
          () =>
            new InternalServerErrorException(
              error?.message ||
                'An unexpected error occurred in the microservice.',
            ),
        );
      }),
    ),
    { defaultValue: (defaultValue !== undefined ? defaultValue : null) as any },
  );
}
