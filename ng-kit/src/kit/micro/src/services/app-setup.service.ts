import { Injectable, Injector } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { map } from 'rxjs/operators';
import { EnvironmentConfigService } from '../../../environment-config/src/services';
import { NodeJsBackendConfigInterface } from '../../../environment-config/src/interfaces';
import { AppSetUpStatusEnum, MicroAppInterface, MicroRegistryService } from '../../../micro';

@Injectable()
export class AppSetUpService {

  private configService: EnvironmentConfigService;
  private http: HttpClient;
  // private microRegistryService: MicroRegistryService;

  constructor(
    private injector: Injector,
  ) {
    this.configService = this.injector.get(EnvironmentConfigService);
    this.http = this.injector.get(HttpClient);
    // this.microRegistryService = this.injector.get(MicroRegistryService);
  }

  setStatus(businessId: string, appName: string, status: AppSetUpStatusEnum): Observable<void> {
    const backendConfig: NodeJsBackendConfigInterface = this.configService.getConfig().backend;
    const url: string = `${backendConfig.commerceos}/api/apps/business/${businessId}/app/${appName}/toggle-setup-status`;

    return this.http.patch<void>(url, { setupStatus: status });
  }

  setStep(businessId: string, appName: string, step: string): Observable<void> {
    const backendConfig: NodeJsBackendConfigInterface = this.configService.getConfig().backend;
    const url: string = `${backendConfig.commerceos}/api/apps/business/${businessId}/app/${appName}/change-setup-step`;

    return this.http.patch<void>(url, { setupStep: step });
  }

  getStatusAndStep(businessId: string, appName: string, microRegistryService: MicroRegistryService): Observable<{status: AppSetUpStatusEnum, step: string}>  {
    const backendConfig: NodeJsBackendConfigInterface = this.configService.getConfig().backend;
    const url: string = `${backendConfig.commerceos}/api/apps/business/${businessId}`;
    const app: MicroAppInterface = microRegistryService.getMicroConfig(appName) as MicroAppInterface;
    if (app) {
      return of({ status: app.setupStatus, step: app.setupStep });
    }

    return this.http.get(url).pipe(map((apps: MicroAppInterface[]) => {
      const currentApp: MicroAppInterface = apps.find((app: MicroAppInterface) => app.code === appName);
      return currentApp && { status: currentApp.setupStatus, step: currentApp.setupStep };
    }));
  }

  // Added one more the same function, but this function doesn't use cache data from microRegistryService,
  // because this service isn't true global service and we can recieve outdated data
  getStatusAndStepFromBackend(businessId: string, appName: string): Observable<{status: AppSetUpStatusEnum, step: string}>  {
    const backendConfig: NodeJsBackendConfigInterface = this.configService.getConfig().backend;
    const url: string = `${backendConfig.commerceos}/api/apps/business/${businessId}`;

    return this.http.get(url).pipe(map((apps: MicroAppInterface[]) => {
      const currentApp: MicroAppInterface = apps.find((app: MicroAppInterface) => app.code === appName);
      return currentApp && { status: currentApp.setupStatus, step: currentApp.setupStep };
    }));
  }

  getStatus(businessId: string, appName: string, microRegistryService: MicroRegistryService): Observable<AppSetUpStatusEnum>  {
    return this.getStatusAndStep(businessId, appName, microRegistryService).pipe(map(a => a && a.status));
  }

  getStep(businessId: string, appName: string, microRegistryService: MicroRegistryService): Observable<string>  {
    return this.getStatusAndStep(businessId, appName, microRegistryService).pipe(map(a => a && a.step));
  }
}
