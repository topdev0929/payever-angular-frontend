import { isPlatformBrowser } from '@angular/common';
import { Inject, Injectable, Optional, Injector, PLATFORM_ID } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { makeStateKey, TransferState } from '@angular/platform-browser';
import { Observable, of, throwError } from 'rxjs';
import { catchError, map, tap } from 'rxjs/operators';
import { SessionStorageService } from 'ngx-webstorage';

import { ENV_CONFIG_TOKEN } from '../env-config-module-config-token';
import { EnviromentConfigModuleConfigInterface, EnvironmentConfigInterface } from '../interfaces';
import { EnvironmentConfigService } from './environment-config.service';
import { AuthHeadersEnum } from '../../../auth/src/services/auth.service';
import { EnvironmentConfigLoaderServiceInterface } from './environment-config-loader.service.interface';

@Injectable()
export class EnvironmentConfigLoaderService implements EnvironmentConfigLoaderServiceInterface {

  private getEnvJson$: Observable<{ [s: string]: any }>;
  private url: string = '/env.json';
  private header: { [headers: string]: string } = {};
  private httpOptions: { headers: { [headers: string]: string } } = {
    headers: this.header
  };

  constructor(
    private httpClient: HttpClient,
    private configService: EnvironmentConfigService,
    protected storageService: SessionStorageService,
    @Optional() private transferState: TransferState,
    @Inject(PLATFORM_ID) private platform: string,
    @Inject(ENV_CONFIG_TOKEN) @Optional() private moduleConfig: EnviromentConfigModuleConfigInterface
  ) { }

  loadEnvironmentConfig(): Observable<boolean> {

    // NOTE: absolute url needed for server side rendering and it is provided in builder-client form prerender.ts
    if (this.moduleConfig && this.moduleConfig.absoluteRootUrl) {
      this.url = `${this.moduleConfig.absoluteRootUrl}/env.json`;
    }

    // This header will be processed in interceptor
    this.header[AuthHeadersEnum.anonym] = 'true';
    let envState: { [s: string]: any };

    // NOTE: env config can be provided from the page prerendered on server (server-side rendering)
    if (this.transferState) {
      const stateFromServer: any = JSON.parse(this.transferState.toJson());
      for (const stateKey of Object.keys(stateFromServer)) {
        if (stateKey.endsWith('/env.json')) {
          envState = stateFromServer[stateKey];
          break;
        }
      }
    }

    this.getEnvJson$ = envState ? of(envState) : this.getEnvData();

    return this.getEnvJson$.pipe(
      tap((data: any) => {
        this.configService.addConfig(data);
        if (this.transferState) {
          this.transferState.set(makeStateKey(this.url), data);
        } else if (isPlatformBrowser(this.platform)) {
          sessionStorage.setItem('env', JSON.stringify(data as EnvironmentConfigInterface));
        }
      }),
      map(() => true),
      catchError(error => throwError(new Error(`Could not load environment config: ${error}`))),
    );
  }

  private getEnvData(): Observable<{ [s: string]: any }> {
    let envData$: Observable<{ [s: string]: any }>;

    const cachedEnvData: EnvironmentConfigInterface = isPlatformBrowser(this.platform) && sessionStorage.getItem('env') ?
      JSON.parse(sessionStorage.getItem('env')) :
      null;
    if (cachedEnvData && Object.keys(cachedEnvData).length > 0 && window.location.hostname !== 'localhost') {
      envData$ = of(cachedEnvData);
    } else {
      envData$ = this.httpClient.get(this.url, this.httpOptions);
    }

    return envData$;
  }
}
