import { Injectable, InjectionToken, Injector } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

import { CommonService } from '../../modules/services/common.service';

export const STORAGE_NAME: InjectionToken<string> = new InjectionToken<string>('root', {
  providedIn: 'root',
  factory: () => 'root',
});

@Injectable()
export class LocalStorageService {

  private flows: {
    [key: string]: BehaviorSubject<any>;
  } = {};
  // new Proxy({}, {
  //   get: function (obj: {}, prop: string): BehaviorSubject<any> {
  //     if (prop in obj) {
  //       return obj[prop];
  //     }

  //     let val: string;
  //     try {
  //       val = this.getItem(prop);
  //     } catch (e) {
  //       val = undefined;
  //     }

  //     const flow: BehaviorSubject<string> = this[`_${prop}`] = new BehaviorSubject(val);
  //     flow.subscribe(value => {
  //       const dataString: string = JSON.stringify(value);
  //       localStorage.setItem(`${this.userEnvironmentSorce}${this.route || ''}${prop}`, dataString);
  //     });
  //     return obj[prop] = flow;
  //   }.bind(this)
  // });

  public route: string;

  private userEnvironmentSorce: string;
  private set userEnvironment(value: string) {
    if (value === this.userEnvironmentSorce) {
      return;
    }

    this.userEnvironmentSorce = value;
    Object.keys(this.flows).forEach(key => {
      const data: any = this.getItem(key);
      this[`_${key}`].next(data);
    });
  }

  constructor(
    private common: CommonService,
    private injector: Injector
  ) {
    this.route = this.injector.get(STORAGE_NAME);
    this.common.businessUuid$.subscribe((businessUuid: string) => {
      this.userEnvironment = businessUuid;
    });
  }

  public getFlow(key: string): BehaviorSubject<any> {
      if (key in this.flows) {
        return this.flows[key];
      }

      let val: string;
      try {
        val = this.getItem(key);
      } catch (e) {
        val = undefined;
      }

      const flow: BehaviorSubject<string> = this[`_${key}`] = new BehaviorSubject(val);
      flow.subscribe((value: any) => {
        const dataString: string = JSON.stringify(value);
        localStorage.setItem(`${this.userEnvironmentSorce}${this.route || ''}${key}`, dataString);
      });
      return this.flows[key] = flow;
  }

  public createFlow(key: string, defaultData?: any): BehaviorSubject<any> {
    const flow: BehaviorSubject<any> = this.getFlow(key);
    if (typeof defaultData !== 'undefined') {
      if (typeof flow.getValue() === 'undefined') {
        flow.next(defaultData);
      }
    }
    return flow;
  }

  public setItem(key: string, data: any): void {
    if (this.getFlow(key)) {
      this[`_${key}`].next(data);
    } else {
      localStorage.setItem(`${this.userEnvironmentSorce}${this.route || ''}${key}`, JSON.stringify(data));
    }
  }

  public getItem(key: string): any {

    let result: any;
    if (typeof this.userEnvironmentSorce === 'undefined') {
      return result;
    }

    let dataString: string;
    dataString = localStorage.getItem(`${this.userEnvironmentSorce}${this.route || ''}${key}`);
    if (dataString && dataString !== 'undefined') {
      try {
        result = JSON.parse(dataString);
      } catch (e) {
        console.error('LocalStorageService JSON.parse error', e, dataString);
      }
    } else {
      dataString = localStorage.getItem(key);
      result = JSON.parse(dataString);
    }
    return result;
  }

}
