import { Injectable, inject } from '@angular/core';
import { Router } from '@angular/router';
import produce from 'immer';

import { StorageService } from './browser-storage';

const win = window as any;

type Merge<T, U> = {
  [K in keyof (T & U)]: K extends keyof U ? U[K] : K extends keyof T ? T[K] : never;
};

@Injectable({
  providedIn: 'root',
})
export class FlowStorage {

  private readonly removeOnCloneKey = '_____removeOnClone__';

  // We can't use LocalStorageService from 'ngx-webstorage' because micros has own instance of LocalStorageService
  // and as result retrieve() gives not real but cached data

  private readonly flowStorageDumpIdKey = '__flowStorageDumpIdKey__';

  private storageSetItemLogged = false;
  private storageGetItemLogged = false;

  private router = inject(Router);
  private storageService = inject(StorageService);


  clearAll(flowId: string): void {
    this.storageRemoveItem(flowId);
  }

  clone(flowFromId: string, flowToId: string): void {
    const full: any = produce(this.storageGetItem(flowFromId) || {}, (draft: any) => {
      Object.entries(draft).forEach(([key, data]: [string, any]) => {
        if (data?.[this.removeOnCloneKey] && draft[key]) {
          delete draft[key];
        }
      });
    });
    this.storageSetItem(flowToId, full);
  }

  getData<T = any>(flowId: string, key: string, defaultData: any = null): T {
    const full: any = this.storageGetItem(flowId) || {};
    const data: any = produce(full[key] || defaultData, (draft: any) => {
      if (draft?.[this.removeOnCloneKey]) {
        delete draft[this.removeOnCloneKey];
      }
    });

    return data;
  }

  setData(flowId: string, key: string, dataParam: any, removeOnClone = false): void {
    const full: any = this.storageGetItem(flowId) || {};
    const data = produce(dataParam, (draft: any) => {
      if (draft && removeOnClone) {
        draft[this.removeOnCloneKey] = true;
      }
    });

    full[key] = data;
    this.storageSetItem(flowId, full);
  }

  clearData(flowId: string, key: string): void {
    const full: any = this.storageGetItem(flowId) || {};
    delete full[key];
    this.storageSetItem(flowId, full);
  }

  mergeData(flowId: string, key: string, data: any): void {
    const full: any = this.storageGetItem(flowId) || {};
    full[key] = this.merge(full[key] || {}, data);
    this.storageSetItem(flowId, full);
  }

  getDump(flowId: string): any {
    return this.storageGetItem(flowId) || {};
  }

  restoreFromDump(flowId: string, dump: any): void {
    if (flowId && dump) {
      this.storageSetItem(flowId, dump);
    }
  }

  setServerFlowDumpCodeId(flowId: string, dumpId: string): void {
    this.setData(flowId, this.flowStorageDumpIdKey, dumpId);
  }

  getServerFlowDumpCodeId(flowId: string): string {
    return this.getData(flowId, this.flowStorageDumpIdKey);
  }

  private getKey(flowId: string): string {
    if (!flowId) {
      throw Error('Attempt to use storage without flowId set');
    }

    return `payever_checkout_flow.${flowId}`;
  }

  private storageRemoveItem(flowId: string): void {
    delete win[this.getKey(flowId)];
    try {
      this.storageService.remove(this.getKey(flowId));
    } catch (e) {}
    this.updateRouteQuery(flowId, null);
  }

  private storageSetItem(flowId: string, data: any): void {
    win[this.getKey(flowId)] = data;
    try {
      this.storageService.set(this.getKey(flowId), JSON.stringify(data));
    } catch (e) {
      if (!this.storageSetItemLogged) {
        this.storageSetItemLogged = true;
      }
    }
    this.updateRouteQuery(flowId, data);
  }

  private storageGetItem(flowId: string): any {
    let data = null;
    try {
      const urlTree = this.router.parseUrl(this.router.url);
      const params: any = urlTree.queryParams;
      data = params.state ? JSON.parse(params.state) : null;
    } catch (e) {}
    data = win[this.getKey(flowId)] || data;
    try {
      data = JSON.parse(this.storageService.get(this.getKey(flowId))) || data;
    } catch (e) {
      if (!this.storageGetItemLogged) {
        this.storageGetItemLogged = true;
      }
    }

    return data;
  }

  private updateRouteQuery(flowId: string, state: any): void {
    if (!navigator.cookieEnabled) {
      const urlTree = this.router.parseUrl(this.router.url);
      const params: any = urlTree.queryParams;
      urlTree.queryParams = {};
      const pathUrl = urlTree.toString();

      const prevState = params.state ? JSON.parse(params.state) : null;

      if (pathUrl === `/pay/${flowId}` && JSON.stringify(prevState) !== JSON.stringify(state)) {
        params.state = JSON.stringify(state);
        this.router.navigate([`/pay/${flowId}`], { queryParams: params });
      }
    }
  }

  private merge<T, U>(target: T, source: U): Merge<T, U> {
    Object.entries(source).forEach(([key, value]) => {
      if (typeof value === 'object' && value !== null && target[key as keyof T]) {
        target[key as keyof T] = this.merge(target[key as keyof T], value) as any;
      } else {
        target[key as keyof T] = value;
      }
    });

    return target as Merge<T, U>;
  }
}
