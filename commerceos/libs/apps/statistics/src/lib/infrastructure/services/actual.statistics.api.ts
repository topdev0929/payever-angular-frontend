import { HttpClient } from '@angular/common/http';
import { Inject, Injectable, InjectionToken } from '@angular/core';

import { EnvService, PE_ENV } from '@pe/common';

export const PE_STATISTICS_API_PATH = new InjectionToken<string>('PE_STATISTICS_API_PATH');

@Injectable({ providedIn: 'root' })
export class ActualPeStatisticsApi {
  constructor(
    @Inject(PE_STATISTICS_API_PATH) private statisticsApiPath: string,
    private http: HttpClient,
    private envService: EnvService,
    @Inject(PE_ENV) private env: any,
  ) {
  }

  getMetrics() {
    return this.http.get(`${this.statisticsApiPath}/api/metric`);
  }

  getDimensions() {
    return this.http.get(`${this.statisticsApiPath}/api/dimension`);
  }

  getDashboards() {
    return this.http.get(`${this.statisticsApiPath}/api/business/${this.envService.businessId}/dashboard`);
  }

  getCurrencyList(): any {
    const config = this.env.backend;

    return this.http.get(`${config.common}/api/currency/list`);
  }

  getDashboardsById(dashboardId: string) {
    return this.http
      .get(`${this.statisticsApiPath}/api/business/${this.envService.businessId}/dashboard/${dashboardId}`);
  }

  editDashboardName(dashboardId: string, payload) {
    return this.http.put(
      `${this.statisticsApiPath}/api/business/${this.envService.businessId}/dashboard/${dashboardId}`,
      payload,
    );
  }

  setAsDefault(dashboardId: string) {
    return this.http.put(
      `${this.statisticsApiPath}/api/business/${this.envService.businessId}/dashboard/${dashboardId}/set-as-default`,
      {},
    );
  }

  deleteDashboardName(dashboardId: string) {
    return this.http.delete(`${this.statisticsApiPath}/api/business/${this.envService.businessId}/dashboard/${dashboardId}`);
  }

  createSingleDashboard(data: any) {
    return this.http.post(`${this.statisticsApiPath}/api/business/${this.envService.businessId}/dashboard`, data);
  }

  removeDashboard(dashboardId: string) {
    return this.http.delete(
      `${this.statisticsApiPath}/api/business/${this.envService.businessId}/dashboard/${dashboardId}`
    );
  }

  getWidgets(dashboardId: string) {
    return this.http.get(
      `${this.statisticsApiPath}/api/business/${this.envService.businessId}/dashboard/${dashboardId}/widget`);
  }

  getFolders() {
    return this.http.get(
      `${this.statisticsApiPath}/api/business/${this.envService.businessId}/folders`);
  }

  createSingleFolder(data) {
    return this.http.post(
      `${this.statisticsApiPath}/api/business/${this.envService.businessId}/folders`,data);
  }

  getWidgetsById(dashboardId: string, widgetId: string) {
    return this.http
      .get(
        `${this.statisticsApiPath}/api/business/${this.envService.businessId}/dashboard/${dashboardId}/widget/${widgetId}`);
  }

  getWidgetTypes(dashboardId: string) {
    return this.http.get(
      `${this.statisticsApiPath}/api/business/${this.envService.businessId}/dashboard/${dashboardId}/widget/available-types`);
  }

  removeWidget(dashboardId: string, widgetId: string) {
    return this.http.delete(`${this.statisticsApiPath}/api/business/${this.envService.businessId}/dashboard/${dashboardId}/widget/${widgetId}`);
  }

  createSingleWidget(dashboardId: string, data: any) {
    return this.http.post(
      `${this.statisticsApiPath}/api/business/${this.envService.businessId}/dashboard/${dashboardId}/widget`, data);
  }

  editSingleWidget(dashboardId: string, widgetId: string, data: any) {
    return this.http
      .put(
        `${this.statisticsApiPath}/api/business/${this.envService.businessId}/dashboard/${dashboardId}/widget/${widgetId}`, data);
  }

  getWidgetStatistics(widgetId: string) {
    return this.http.get(`${this.statisticsApiPath}/${widgetId}/statistics`);
  }

  getWidgetData(widgetType: string = 'transactions') {
    return this.http
      .get(`${this.statisticsApiPath}/api/business/${this.envService.businessId}/widgetData/${widgetType}`);
  }

  getWidgetTypeData() {
    return this.http
      .get(`${this.statisticsApiPath}/api/business/${this.envService.businessId}/widgetData/widget-types`);
  }

  getBusinesses() {
    return this.http.get(`${this.statisticsApiPath}/api/business`);
  }
}
