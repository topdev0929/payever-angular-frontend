import { Injectable } from '@angular/core';
import { Observable, of, throwError } from 'rxjs';
import { catchError, map, mergeMap, share, take, tap } from 'rxjs/operators';

import { NodeJsFrontendConfigInterface } from '../../environment-config';
import { MicroAppInterface } from '../types';

import { BaseMicroService } from './base-micro.service';

/* @deprecated */
@Injectable()
export class MicroLoaderService extends BaseMicroService {

  private buildHashObservables: { [key: string]: Observable<string> } = {};
  private buildMicroConfigObservables: { [key: string]: Observable<MicroAppInterface> } = {};
  private buildObservables: { [key: string]: Observable<boolean> | null } = {};
  private innerBuildObservables: { [key: string]: Observable<boolean> | null } = {};
  private readonly microFileName: string = 'micro';

  loadBuildHash(microCode: string, subPath: string | null = null): Observable<string> {
    if (!this.buildHashObservables[microCode]) {
      this.buildHashObservables[microCode] = this._createBuildHashObservable(microCode, subPath)
        .pipe(
          take(1),
          share(),
          tap(() => delete this.buildHashObservables[microCode])
        );
    }

    return this.buildHashObservables[microCode];
  }

  loadBuild(microCode: keyof NodeJsFrontendConfigInterface, forceReload: boolean = false): Observable<boolean | null> {
    if (forceReload) {
      this.buildObservables[microCode] = null;
    }

    if (!this.buildObservables[microCode]) {
      this.buildObservables[microCode] = this._createBuildObservable(microCode, forceReload)
        .pipe(
          take(1),
          share(),
          tap(() => delete this.buildObservables[microCode])
        );
    }

    return this.buildObservables[microCode] ?? of(null);
  }

  loadInnerMicroBuildEx(
    microCode: keyof NodeJsFrontendConfigInterface,
    innerMicroCode: string,
    subPath: string,
    forceReload = false
  ): Observable<boolean | null>{
    if (forceReload) {
      this.innerBuildObservables[microCode] = null;
    }

    if (!this.innerBuildObservables[microCode]) {
      this.innerBuildObservables[microCode] = this._createInnerMicroBuildObservable(microCode, innerMicroCode, subPath, forceReload)
        .pipe(
          take(1),
          share(),
          tap(() => delete this.innerBuildObservables[microCode])
        );
    }

    return this.innerBuildObservables[microCode] ?? of(null);
  }

  loadMicroByScriptUrl(bootstrapScriptUrl: string): Observable<boolean> {
    const url = bootstrapScriptUrl;

    return this.loadScript(url, null);
  }

  getResourceUrl(
    microCode: keyof NodeJsFrontendConfigInterface,
    buildHash: string | null,
    resourceName: string,
    resourceType: string,
    allowCache = true
  ): string {
    const config = this.envConfig.frontend;

    if (config?.[microCode]) {
      const now = new Date();
      const hourHash = `${now.getDay()}-${now.getMonth()}-${now.getFullYear()}`;

      return `${config[microCode]}/${resourceName}.${resourceType}?${buildHash || hourHash}`;
    } else {
      const date = +new Date();
      const cache = allowCache ? '' : `?${date}`;
      // For wrapper tests
      return `/dist_ext/${microCode}/${resourceName}.${resourceType}${cache}`;
    }
  }

  private _createBuildObservable(
    microCode: keyof NodeJsFrontendConfigInterface,
    forceReload = false
  ): Observable<boolean> {
    return this.loadBuildHash(microCode).pipe(
      mergeMap((buildHash: string) => {
        const url: string = this.getResourceUrl(microCode, buildHash, this.microFileName, 'js');
        if (forceReload) {
          this.registry.scripts[url] = null;
        }

        return this.loadScript(url, microCode);
      })
    );
  }

  private _createInnerMicroBuildObservable(
    microCode: keyof NodeJsFrontendConfigInterface,
    innerMicroCode: string,
    subPath: string | null = null,
    forceReload = false
  ): Observable<boolean> {
    return this.loadBuildHash(microCode, subPath).pipe(
      mergeMap((buildHash: string) => {
        return this._createBuildMicroConfigObservable(microCode, subPath).pipe(mergeMap((config: MicroAppInterface) => {
          if (!config.innerMicros?.[innerMicroCode]?.bootstrapScriptUrl) {
            throw new Error(`Cant find inner micro: ${innerMicroCode}`);
          }
          const url: string = config.innerMicros[innerMicroCode].bootstrapScriptUrl;
          if (forceReload) {
            this.registry.scripts[url] = null;
          }

          return this.loadScript(url, microCode);
        }));
      })
    );
  }

  private _createBuildHashObservable(microCode: string, subPath: string | null = null): Observable<string> {
    return of('');
  }

  private _createBuildMicroConfigObservable(
    microCode: keyof NodeJsFrontendConfigInterface,
    subPath: string | null = null
  ): Observable<MicroAppInterface> {
    if (this.registry.buildMicroConfigs[microCode]) {
      return of(this.registry.buildMicroConfigs[microCode]);
    } else {
      const logStart: number = new Date().getTime();
      if (subPath) {
        subPath = subPath.split('/').filter(a => a !== '').join('/') + '/';
      }
      const url: string = this.getResourceUrl(microCode, null, `${subPath || ''}micro.config`, 'json', false);

      return this.httpClient.get(url).pipe(
        map((config: any) => {
          this.registry.buildMicroConfigs[microCode] = config;

          return config;
        }),
        catchError((error) => {
          this.apmService.apm.captureError(`Cant load micro config during ${new Date().getTime() - logStart}ms at '${url}':\n ${error.message || JSON.stringify(error)}`);

          return throwError(error);
        })
      );
    }
  }
}
