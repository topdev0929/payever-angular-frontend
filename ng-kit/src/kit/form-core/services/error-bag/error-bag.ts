import { map, take } from 'rxjs/operators';
import { cloneDeep, forEach, isString, snakeCase } from 'lodash-es';
import { BehaviorSubject ,  Observable } from 'rxjs';
import { flatten } from 'flat';
import { Injectable } from "@angular/core";

export interface ErrorBagFlatData {
  [key: string]: string;
}

export interface ErrorBagDeepData {
  [key: string]: string | ErrorBagDeepData;
}

@Injectable()
export class ErrorBag {

  private isSnakeKeysMode: boolean = false;
  private errorsSubject: BehaviorSubject<ErrorBagDeepData> = new BehaviorSubject<ErrorBagDeepData>({});
  private errorsFlatSubject: BehaviorSubject<ErrorBagFlatData> = new BehaviorSubject<ErrorBagFlatData>({});

  get errors$(): Observable<ErrorBagDeepData> {
    return this.errorsSubject.asObservable();
  }

  get errorsFlat$(): Observable<ErrorBagFlatData> {
    return this.errorsFlatSubject.asObservable();
  }

  setSnakeKeysMode(mode: boolean): void {
    this.isSnakeKeysMode = mode;
  }

  /**
   * Set global errors and convert keys to snake case.
   */
  setErrors(errors: ErrorBagDeepData): void {
    let errorsData: ErrorBagDeepData = cloneDeep(errors);

    if (this.isSnakeKeysMode) {
      errorsData = this.arrayKeysToSnakeCase(errorsData);
    }

    this.errorsSubject.next(errorsData);
    this.errorsFlatSubject.next(flatten(errorsData) as ErrorBagFlatData);
  }

  getError(field: string): string {
    let error: string = null;

    this.getError$(field)
      .pipe(take(1))
      .subscribe((errorValue: string) => error = errorValue);

    return error;
  }

  /**
   * @param 'field' can have format like 'customer.first_name'.
   */
  getError$(field: string): Observable<string> {
    return this.errorsFlat$.pipe(
      map((data: ErrorBagFlatData): string => data[field])
    );
  }

  private arrayKeysToSnakeCase(data: {}): {} {
    const result: {} = {};
    forEach(data, (value, key) => {
      result[snakeCase(key)] = isString(value) ? value : this.arrayKeysToSnakeCase(value);
    });
    return result;
  }
}
