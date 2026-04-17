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
          return throwError(
            () => new HttpException(error.message, error.status),
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
