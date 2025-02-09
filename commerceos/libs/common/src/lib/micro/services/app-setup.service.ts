import { HttpClient } from '@angular/common/http';
import { Injectable, Injector } from '@angular/core';
import { Observable, of } from 'rxjs';
import { map } from 'rxjs/operators';

import { EnvironmentConfigInterface, NodeJsBackendConfigInterface, PE_ENV } from '../../environment-config';
import { AppSetUpStatusEnum, MicroAppInterface } from '../types';

import { MicroRegistryService } from './micro-registry.service';

@Injectable()
export class AppSetUpService {

  protected httpClient: HttpClient = this.injector.get(HttpClient);
  protected envConfig: EnvironmentConfigInterface = this.injector.get(PE_ENV);

  constructor(private injector: Injector) {
  }

  setStep(businessId: string, appName: string, step: string): Observable<void> {
    const backendConfig: NodeJsBackendConfigInterface = this.envConfig.backend;
    const url = `${backendConfig.commerceos}/api/apps/business/${businessId}/app/${appName}/change-setup-step`;

    return this.httpClient.patch<void>(url, { setupStep: step });
  }

  getStatusAndStep(
    businessId: string,
    appName: string,
    microRegistryService: MicroRegistryService
  ): Observable<{ status?: AppSetUpStatusEnum, step?: string } | undefined> {
    const backendConfig: NodeJsBackendConfigInterface = this.envConfig.backend;
    const url = `${backendConfig.commerceos}/api/apps/business/${businessId}`;
    const app = microRegistryService.getMicroConfig(appName);

    if (app && !Array.isArray(app) && app.setupStatus && app.setupStep) {
      return of({ status: app.setupStatus, step: app.setupStep });
    }

    return this.httpClient.get<MicroAppInterface[]>(url).pipe(
      map((apps) => {
        const currentApp = apps.find(app => app.code === appName);

        if (currentApp) {
          return { status: currentApp.setupStatus, step: currentApp.setupStep };
        }

        return undefined;
      })
    );
  }

  getStatus(
    businessId: string,
    appName: string,
    microRegistryService: MicroRegistryService
  ): Observable<AppSetUpStatusEnum | undefined> {
    return this.getStatusAndStep(businessId, appName, microRegistryService).pipe(
      map(a => a?.status)
    );
  }

  getStep(
    businessId: string,
    appName: string,
    microRegistryService: MicroRegistryService
  ): Observable<string | undefined> {
    return this.getStatusAndStep(businessId, appName, microRegistryService).pipe(
      map(a => a?.step)
    );
  }
}
