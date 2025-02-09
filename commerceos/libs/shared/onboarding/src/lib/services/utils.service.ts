import { Injectable } from '@angular/core';
import { compileExpression, Options } from 'filtrex';
import { get, isString } from 'lodash-es';
import { Observable, of } from 'rxjs';

import { ActionDTO } from '../models';

@Injectable({ providedIn: 'root' })
export class OnboardingUtilsService {
  regexp = /(:)[^/\s]+/g;
  conditionRegexp = /(?=:[\w])[^/\s]+/g;

  private captureValues = {};

  set captureValue(value: any) {
    this.captureValues = {
      ...this.captureValues,
      ...value,
    };
  }

  fillDataAction(action: ActionDTO): ActionDTO {
    const data = { ...action };
    if (data.url) {
      data.url = this.parseActionString(data.url);
    }

    if (data.payload) {
      data.payload = this.parseActionObject(data.payload);
    }

    if (data.ifTrue) {
      data.ifTrue = this.parseActionCondition(data.ifTrue.toString());
    }

    return data;
  }

  parseActionString(data: string): string {
    const matches = this.regexp.exec(data)?.map(s => s.slice(1));
    if (matches?.length) {
      matches.filter(Boolean).forEach((match) => {
        data = data.replace(`:${match}`, this.captureValues[match]);
      });
    }

    return data;
  }

  parseActionObject(payload: object): object {
    const result = {};
    Object.entries(payload).forEach(([key, value]: [string, any]) => {
      result[key] = isString(value) ? this.parseActionString(value) : value;
    });

    return result;
  }

  parseActionCondition(condition: string): boolean {
    const matches = this.conditionRegexp.exec(condition);
    const options: Options = {
      constants: {
        true: true,
        false: false,
      },
    };

    if (matches) {
      matches.forEach((match) => {
        condition = condition.replace(match, match.slice(1));
      });
    }

    const compiled = compileExpression(condition, options);

    return !!compiled(this.captureValues);
  }

  captureActionResponse(action: ActionDTO, response: any): Observable<object> {
    if (action.capture && response) {
      return new Observable((observer) => {
        Object.entries(action.capture).forEach(([key, value]) => {
          this.captureValues[key] = get(response, value);
        });

        let result = {};

        if (action.returns) {
          result = this.parseActionObject(action.returns);
        }

        observer.next(result);
        observer.complete();
      });
    }

    return of({});
  }

  clearCaptureValues(): void {
    this.captureValues = {};
  }

  parseUrl(redirectUrl: string, pluginHash: string): string {
    const url = new URL(redirectUrl);
    const searchParams = new URLSearchParams(url.search);
    pluginHash && searchParams.append('hash', pluginHash);

    return `${url.origin}${url.pathname}?${searchParams.toString()}`;
  }
}
