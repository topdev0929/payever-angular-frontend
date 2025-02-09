import { HttpClient } from '@angular/common/http';
import { Inject, Injectable } from '@angular/core';
import { EMPTY, Observable } from 'rxjs';
import { mergeMap, map } from 'rxjs/operators';

import { PE_ENV, EnvironmentConfigInterface as EnvInterface } from '@pe/common';
import { CustomWidgetConfigInterface, WidgetConfigInterface, WidgetTypeEnum } from '@pe/checkout-types';

import {
  CheckoutChannelSetInterface,
  IntegrationInfoInterface,
  CheckoutInterface,
  CheckoutConnectionInterface,
  DefaultConnectionInterface,
  PaymentOptionsInterface,
  BusinessInterface,
  SantanderDkProductInterface,
} from '../../../modules/finexp-editor/src/interfaces';
import {
  InstalledConnectionInterface,
  IntegrationConnectInfoInterface,
  SectionAvailableInterface,
  UserBusinessInterface,
} from '../../../modules/finexp-editor/src/deprecated/interfaces';
import { FinexpApiAbstractService } from '../../../modules/finexp-editor/src/services';

@Injectable({
  providedIn: 'root'
})
export class FinexpApiService implements FinexpApiAbstractService {

  private readonly finExpIntegrationCode: string = 'finance-express';

  constructor(
    @Inject(PE_ENV) private env: EnvInterface,
    private http: HttpClient
  ) {
  }

  getDefaultConnection(channelSet: string, paymentType: string): Observable<DefaultConnectionInterface> {
    return EMPTY;
  }

  getCheckouts(businessId: string): Observable<CheckoutInterface[]> {
    return this.http.get<CheckoutInterface[]>(`${this.env.backend.checkout}/api/business/${businessId}/checkout`);
  }

  getCheckoutSectionsAvailable(businessId: string, checkoutUuid: string): Observable<SectionAvailableInterface[]> {
    return this.http.get<SectionAvailableInterface[]>(
      `${this.env.backend.checkout}/api/business/${businessId}/checkout/${checkoutUuid}/sections/available`
    );
  }

  getUserBusiness(businessId: string): Observable<UserBusinessInterface> {
    return this.http.get<UserBusinessInterface>(`${this.env.backend.users}/api/business/${businessId}`);
  }

  addNewCheckout(businessId: string, data: CheckoutInterface): Observable<CheckoutInterface> {
    return this.http.post<CheckoutInterface>(`${this.env.backend.checkout}/api/business/${businessId}/checkout`, data);
  }

  saveCheckout(businessId: string, checkoutId: string, data: CheckoutInterface): Observable<CheckoutInterface> {
    // tslint:disable-next-line:max-line-length
    return this.http.patch<CheckoutInterface>(`${this.env.backend.checkout}/api/business/${businessId}/checkout/${checkoutId}`, data).pipe(map(d => {
      return d || {...data, _id: checkoutId}; // Small fix required because BE doesn't return result
    }));
  }

  setDefaultCheckout(businessId: string, checkoutId: string): Observable<void> {
    return this.http.patch<void>(`${this.env.backend.checkout}/api/business/${businessId}/checkout/${checkoutId}/default`, {});
  }

  getChannelSets(businessId: string): Observable<CheckoutChannelSetInterface[]> {
    return this.http.get<CheckoutChannelSetInterface[]>(`${this.env.backend.checkout}/api/business/${businessId}/channelSet`);
  }

  getCheckoutChannelSets(businessId: string, checkoutId: string): Observable<CheckoutChannelSetInterface[]> {
    return this.http.get<CheckoutChannelSetInterface[]>(`${this.env.backend.checkout}/api/business/${businessId}/channelSet/checkout/${checkoutId}`);
  }

  attachChannelSetToCheckout(businessId: string, channelSetId: string, checkoutId: string): Observable<void> {
    // tslint:disable:max-line-length
    return this.http.patch<void>(`${this.env.backend.checkout}/api/business/${businessId}/channelSet/${channelSetId}/checkout`, {checkoutId: checkoutId});
  }

  getCurrencyByChannelSetId(channelSetId: string): Observable<string> {
    return this.http.get<{ currency: string }>(`${this.env.backend.checkout}/api/flow/channel-set/${channelSetId}/currency`).pipe(map(data => data.currency));
  }

  getIntegrationsInfo(businessId: string): Observable<IntegrationInfoInterface[]> {
    return this.http.get<IntegrationInfoInterface[]>(`${this.env.backend.checkout}/api/business/${businessId}/integration`);
  }

  getCheckoutEnabledIntegrations(businessId: string, checkoutId: string): Observable<string[]> {
    return this.http.get<string[]>(`${this.env.backend.checkout}/api/business/${businessId}/checkout/${checkoutId}/integration`);
  }

  toggleCheckoutIntegration(businessId: string, checkoutId: string, integrationName: string, enable: boolean): Observable<void> {
    return this.http.patch<void>(
      `${this.env.backend.checkout}/api/business/${businessId}/checkout/${checkoutId}/integration/${integrationName}/${enable ? 'install' : 'uninstall'}`,
      {}
    );
  }

  getInstalledConnections(businessId: string): Observable<CheckoutConnectionInterface[]> {
    return this.http.get<CheckoutConnectionInterface[]>(`${this.env.backend.checkout}/api/business/${businessId}/connection`);
  }

  getInstalledCheckoutConnections(businessId: string, checkoutId: string): Observable<CheckoutConnectionInterface[]> {
    return this.http.get<CheckoutConnectionInterface[]>(`${this.env.backend.checkout}/api/business/${businessId}/checkout/${checkoutId}/connection`);
  }

  getBusinessConnections(businessId: string): Observable<InstalledConnectionInterface[]> {
    return this.http.get<InstalledConnectionInterface[]>(`${this.env.backend.checkout}/api/business/${businessId}/connection`);
  }

  // FINANCE EXPRESS API

  getWidgets(businessId: string, checkoutId: string): Observable<WidgetConfigInterface[]> {
    return this.http.post<CustomWidgetConfigInterface[]>(
      `${this.env.backend.webWidgets}/api/app/${this.finExpIntegrationCode}/business/${businessId}/action/get-widgets`,
      { checkoutId }
    );
  }

  getWidgetSettingsByType(businessId: string, checkoutId: string, widgetType: WidgetTypeEnum): Observable<CustomWidgetConfigInterface> {
    return this.http.post<CustomWidgetConfigInterface>(
      `${this.env.backend.webWidgets}/api/app/${this.finExpIntegrationCode}/business/${businessId}/action/get-widgets-by-type`,
      { checkoutId, widgetType }
    );
  }

  getWidgetSettingsById(businessId: string, checkoutId: string, widgetId: string): Observable<WidgetConfigInterface> {
    return this.http.post<CustomWidgetConfigInterface>(
      `${this.env.backend.webWidgets}/api/app/${this.finExpIntegrationCode}/business/${businessId}/action/get-widgets-by-id`,
      { checkoutId, widgetId }
    );
  }

  createWidgetSettings(businessId: string, data: WidgetConfigInterface): Observable<WidgetConfigInterface> {
    return this.http.post<CustomWidgetConfigInterface>(
      `${this.env.backend.webWidgets}/api/app/${this.finExpIntegrationCode}/business/${businessId}/action/widget-create`,
      data
    );
  }

  saveWidgetSettings(businessId: string, widgetId: string, data: WidgetConfigInterface): Observable<WidgetConfigInterface> {
    return this.http.post<CustomWidgetConfigInterface>(
      `${this.env.backend.webWidgets}/api/app/${this.finExpIntegrationCode}/business/${businessId}/action/widget-update`,
      { ...data, widgetId }
    );
  }

  deleteWidgetSettings(businessId: string, widgetId: string): Observable<void> {
    return this.http.post<void>(
      `${this.env.backend.webWidgets}/api/app/${this.finExpIntegrationCode}/business/${businessId}/action/widget-delete`,
      { widgetId }
    );
  }

  getConnectIntegrationInfo(businessId: string, integrationId: string): Observable<IntegrationConnectInfoInterface> {
    return this.http.get<IntegrationConnectInfoInterface>
    (`${this.env.backend.connect}/api/integration/${integrationId}`);
  }

  getPaymentOptions(currency: string): Observable<PaymentOptionsInterface[]> {
    return this.http.get<PaymentOptionsInterface[]>(`${this.env.custom.proxy}/api/rest/v1/payment-options`, {
      params: currency ? { _currency: currency } : {}
    });
  }

  // USER API

  getBusiness(businessId: string): Observable<BusinessInterface> {
    return this.http.get<BusinessInterface>(`${this.env.backend.users}/api/business/${businessId}`);
  }

  // Some custom functionality

  getSantanderDkProductsEx(businessId: string, channelSet: string): Observable<SantanderDkProductInterface[]> {
    return this.http.get<{_id: string}>(
      `${this.env.backend.checkout}/api/channel-set/${channelSet}/default-connection/santander_installment_dk`
    ).pipe(mergeMap(connection => {
      return this.http.post<SantanderDkProductInterface[]>(
        `${ this.env.thirdParty.payments }/api/business/${businessId}/connection/${connection._id}/action/get-products-by-connection`, {}
      );
    }));
  }
}
