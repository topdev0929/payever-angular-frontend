import { Inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import { EnvironmentConfigInterface as EnvInterface, NodeJsBackendConfigInterface, PE_ENV, PeSearchItem } from '@pe/common';

import {
  IntegrationCategory,
  IntegrationInfoInterface,
  IntegrationShortStatusInterface,
  IntegrationStatusInterface,
  IntegrationReviewInterface,
  IntegrationVersionInterface,
  CustomIntegrationsFolder,
  IntegrationsListResponseInterface,
  IntegrationSubscriptionInterface
} from '../interfaces';
import { BusinessService } from './business.service';

@Injectable({
  providedIn: 'root'
})
export class IntegrationsApiService {

  constructor(
    private http: HttpClient,
    private businessService: BusinessService,
    @Inject(PE_ENV) private envConfig: EnvInterface
  ) {
  }

  getSomeIntegrationInstalled(): Observable<boolean> {
    const businessId = this.businessService.getBusinessId();
    const config: NodeJsBackendConfigInterface = this.envConfig.backend;

    return this.http.get<{ integrations: IntegrationStatusInterface[] }>(
      `${config.connect}/api/business/${businessId}/integration`
    ).pipe(map((data: { integrations: IntegrationStatusInterface[] }) => {
      return !!data.integrations.find(d => d.installed);
    }));
  }

  getCategoryIntegrationInfos(category?: IntegrationCategory): Observable<IntegrationInfoInterface[]> {
    const config: NodeJsBackendConfigInterface = this.envConfig.backend;

    return this.http.get<IntegrationInfoInterface[]>(
      category ?
        `${config.connect}/api/integration/category/${category}` :
        `${config.connect}/api/integration?limit=1000`
    ).pipe(map((data: IntegrationInfoInterface[]) => {
      return data;
    }));
  }

  getCategoryIntegrationStatuses(
    business: string,
    active: boolean,
    categories: IntegrationCategory[] = [],
    searchFilters: PeSearchItem[] = [],
    page = 1,
    limit: number = 12
  ): Observable<IntegrationsListResponseInterface> {
    const config: NodeJsBackendConfigInterface = this.envConfig.backend;
    let url = `${config.connect}/api/business/${business}/integration${active ? '/active' : ''}`;
    let queryParams = `?page=${page === 0 ? 1 : page}&limit=${limit}`;
    if (categories.length) {
      url = `${config.connect}/api/business/${business}/integration`;
      categories.forEach(category => queryParams += `&categories=${category}`);
    }
    if (searchFilters.length) {
      url = `${config.connect}/api/business/${business}/integration${active ? '/active' : ''}`;
      searchFilters.forEach(
        filter => queryParams += filter.contains ? `&notContainName=${filter.searchText}` : `&containName=${filter.searchText}`
      );
    }
    return this.http.get<IntegrationsListResponseInterface>(url + queryParams);
  }

  getIntegrationInfo(name: string): Observable<IntegrationInfoInterface> {
    const config: NodeJsBackendConfigInterface = this.envConfig.backend;

    return this.http.get<IntegrationInfoInterface>(
      `${config.connect}/api/integration/${name}`
    );
  }

  getIntegrationStatus(business: string, name: string): Observable<IntegrationShortStatusInterface> {
    const config: NodeJsBackendConfigInterface = this.envConfig.backend;

    return this.http.get<IntegrationShortStatusInterface>(
      `${config.connect}/api/business/${business}/integration/${name}`
    );
  }

  installIntegration(business: string, name: string, install: boolean = true): Observable<IntegrationShortStatusInterface> {
    const config: NodeJsBackendConfigInterface = this.envConfig.backend;

    return this.http.patch<IntegrationShortStatusInterface>(
      `${config.connect}/api/business/${business}/integration/${name}/${install ? 'install' : 'uninstall'}`,
      {}
    );
  }

  setStatus(businessId: string): Observable<void> {
    const config: NodeJsBackendConfigInterface = this.envConfig.backend;
    const url: string = `${config.commerceos}/api/apps/business/${businessId}/app/connect/toggle-setup-status`;

    return this.http.patch<void>(url, {setupStatus: 'completed'});
  }

  startTrial(businessId: string): Observable<void> {
    const config: NodeJsBackendConfigInterface = this.envConfig.backend;
    const url: string = `${config.connect}/api/subscriptions/trials/${businessId}`;
    return this.http.post<void>(url, {
      appName: 'connect'
    });
  }

  /**
   * Add review to integration
   * @param name - integration name
   * @param review - review data
   */
  addIntegrationReview(name: string, review: IntegrationReviewInterface): Observable<void> {
    const config: NodeJsBackendConfigInterface = this.envConfig.backend;

    return this.http.patch<void>(`${config.connect}/api/integration/${name}/add-review`, review);
  }

  /**
   * Add rating to integration
   * @param name - integration name
   * @param rating - rating number
   */
  rateIntegration(name: string, rating: number): Observable<void> {
    const config: NodeJsBackendConfigInterface = this.envConfig.backend;

    return this.http.patch<void>(`${config.connect}/api/integration/${name}/rate`, {rating});
  }

  /**
   * Get integration versions
   * @param name - integration name
   */
  getIntegrationVersions(name: string): Observable<IntegrationVersionInterface[]> {
    const config: NodeJsBackendConfigInterface = this.envConfig.backend;

    return this.http.get<IntegrationVersionInterface[]>(`${config.connect}/api/integration/${name}/versions`);
  }

  getCustomFolders(business: string): Observable<CustomIntegrationsFolder[]> {
    const config: NodeJsBackendConfigInterface = this.envConfig.backend;
    return this.http.get<CustomIntegrationsFolder[]>(`${config.connect}/api/${business}/folders`);
  }

  getCustomFolderIntegrations(
    business: string,
    folderId: string,
    searchFilters: PeSearchItem[] = []
  ): Observable<IntegrationSubscriptionInterface[]> {
    const config: NodeJsBackendConfigInterface = this.envConfig.backend;
    const url = `${config.connect}/api/${business}/folders/${folderId}/integrations`;
    let queryParams = '';
    if (searchFilters.length) {
      queryParams += '?';
      searchFilters.forEach(
        filter => queryParams += filter.contains ? `&notContainName=${filter.searchText}` : `&containName=${filter.searchText}`
      );
    }
    return this.http.get<IntegrationSubscriptionInterface[]>(url + queryParams);
  }

  createCustomFolder(business: string, data: CustomIntegrationsFolder): Observable<CustomIntegrationsFolder> {
    const config: NodeJsBackendConfigInterface = this.envConfig.backend;
    return this.http.post<CustomIntegrationsFolder>(`${config.connect}/api/${business}/folders`, data);
  }

  updateCustomFolder(business: string, folderId: string, data: CustomIntegrationsFolder): Observable<CustomIntegrationsFolder> {
    const config: NodeJsBackendConfigInterface = this.envConfig.backend;
    return this.http.patch<CustomIntegrationsFolder>(`${config.connect}/api/${business}/folders/${folderId}`, data);
  }

  deleteCustomFolder(business: string, folderId: string): Observable<any> {
    const config: NodeJsBackendConfigInterface = this.envConfig.backend;
    return this.http.delete<any>(`${config.connect}/api/${business}/folders/${folderId}`);
  }
}
