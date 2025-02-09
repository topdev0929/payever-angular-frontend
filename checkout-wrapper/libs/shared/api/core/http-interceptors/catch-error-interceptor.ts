import { HttpErrorResponse, HttpEvent, HttpHandler, HttpRequest } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';

import { ResponseErrorsInterface } from '@pe/checkout/types';
import { cloneDeep } from '@pe/checkout/utils/src';

import { ApiErrorMessageTransformerService } from './transform-api-errors';


interface NodeJsErrorInterface {
  target: any;
  value: any;
  property: string;
  constraints: {
    [key: string]: string;
  };
  children: NodeJsErrorInterface[];
}

interface ErrorBagFlatData {
  [key: string]: string;
}
export interface ErrorBagDeepData {
  [key: string]: string | ErrorBagDeepData;
}

@Injectable()
export class CatchEveryErrorInterceptor {

  readonly maxMessageLength: number = 128;

  constructor(
    private apiErrorMessageTransformer: ApiErrorMessageTransformerService,
  ) { }

  intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    return next.handle(request)
      .pipe(
        catchError((err: HttpErrorResponse) => throwError(this.processError(err)))
      );
  }

  processError(err: HttpErrorResponse): ResponseErrorsInterface {
    let result: ResponseErrorsInterface = cloneDeep(err.error ?? err);
    if (err.error && this.isString(err.error.error) && err.error.statusCode) {
      // Send flow via SMS/Email uses this format
      result = (({
        code: err.error.statusCode,
        message: String(err.error.error),
        errors: this.nodejsToFlat(err.error.message),
      }) as ResponseErrorsInterface);
    } else if (this.isString(err.error)) {
      result = (({
        message: String(err.error),
      }) as ResponseErrorsInterface);
    } else if (!result) {
      result = (({}) as ResponseErrorsInterface);
    }

    if (!result.code) {
      result.code = err.status || 400;
    }
    if (!result.message) {
      result.message = err.message || $localize `:@@error.unknown_error:`;
    }
    if (this.isString(result.message) && result.message.length > this.maxMessageLength) {
      result.message = `${result.message.substring(0, this.maxMessageLength).trim()}...`;
    }
    if (!result.errors) {
      result.errors = {};
    }
    result.raw = err;

    return this.apiErrorMessageTransformer.transform(result);
  }

  // Following code is copied from ErrorNormalizerService
  // We have to copy-paste because if we import ErrorNormalizerService build become 115kb bigger (gzipped)

  nodejsToFlat(errors: NodeJsErrorInterface): ErrorBagFlatData {
    const result: ErrorBagFlatData = {};
    if (errors && Array.isArray(errors)) {
      errors.forEach((err) => {
        if (err?.property) {
          if (err.constraints) {
            result[err.property] = Object.values(err.constraints).join(', ');
          } else if (err.children && Array.isArray(err.children)) {
            Object.entries(this.nodejsToFlat(err.children)).forEach(([childKey, childValue]: [string, string]) => {
              result[`${err.property}.${childKey}`] = childValue;
            });
          }
        }
      });
    }

    return result;
  }

  nodejsAsLine(errors: NodeJsErrorInterface, defaultError: string = null): string {
    const flat: ErrorBagFlatData = this.nodejsToFlat(errors);

    return Object.values(flat).length > 0 ? Object.values(flat).join(', ') : defaultError;
  }

  private isString(string: unknown): boolean {
    return typeof string == 'string' || string instanceof String;
  }
}
