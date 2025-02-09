import { InjectionToken } from '@angular/core';
import { MonoTypeOperatorFunction, timer } from 'rxjs';
import { exhaustMap, takeUntil, takeWhile, tap } from 'rxjs/operators';

import { PollingConfig, PollingError } from '@pe/checkout/types';

export const POLLING_CONFIG = new InjectionToken<PollingConfig>('Polling configuration', {
  providedIn: 'root',
  factory: () => DEFAULT_POLLING_CONFIG,
});

export const DEFAULT_POLLING_CONFIG: PollingConfig = {
  pollingInterval: 5000,
  maxTimeout: 180000,
};

export function pollWhile<T>(
  config: PollingConfig,
  guardFn: (value: T) => boolean,
  throwError = true,
): MonoTypeOperatorFunction<T> {
  return source$ => timer(0, config.pollingInterval).pipe(
    exhaustMap(() => source$),
    takeWhile(guardFn, true),
    takeUntil(timer(config.maxTimeout).pipe(
      tap(() => {
        if (throwError) {
          throw new PollingError('timeout', 'Polling timeout!');
        }
      }),
    )),
  );
}

export function isPollingError(error: Object): error is PollingError {
  return error instanceof PollingError;
}
