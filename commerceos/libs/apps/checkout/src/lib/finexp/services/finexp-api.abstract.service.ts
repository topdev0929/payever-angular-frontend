import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { WidgetConfigInterface, WidgetTypeEnum } from '@pe/checkout-types';

import {
  BusinessInterface,
  SantanderDkProductInterface,
  CheckoutInterface,
  PaymentOptionsInterface,
  IntegrationInfoInterface,
  SectionAvailableInterface,
  CheckoutConnectionInterface,
  CheckoutChannelSetInterface,
  InstalledConnectionInterface,
  IntegrationConnectInfoInterface,
  DefaultConnectionInterface,
} from '../interfaces';

@Injectable()
export abstract class FinexpApiAbstractService {

  abstract getCheckouts(businessId: string): Observable<CheckoutInterface[]>;

  abstract getCheckoutSectionsAvailable(businessId: string, checkoutUuid: string): Observable<SectionAvailableInterface[]>;

  abstract addNewCheckout(businessId: string, data: CheckoutInterface): Observable<CheckoutInterface>;

  abstract saveCheckout(businessId: string, checkoutId: string, data: CheckoutInterface): Observable<CheckoutInterface>;

  abstract setDefaultCheckout(businessId: string, checkoutId: string): Observable<void>;

  abstract getCheckoutChannelSets(businessId: string, checkoutId: string): Observable<CheckoutChannelSetInterface[]>;

  abstract attachChannelSetToCheckout(businessId: string, channelSetId: string, checkoutId: string): Observable<void>;

  abstract getCurrencyByChannelSetId(channelSetId: string): Observable<string>;

  abstract getIntegrationsInfo(businessId: string): Observable<IntegrationInfoInterface[]>;

  abstract getInstalledConnections(businessId: string): Observable<CheckoutConnectionInterface[]>;

  abstract getBusinessConnections(businessId: string): Observable<InstalledConnectionInterface[]>;

  abstract getWidgets(businessId: string, checkoutId: string): Observable<WidgetConfigInterface[]>;

  abstract getWidgetSettingsByType(businessId: string, checkoutId: string, widgetType: WidgetTypeEnum): Observable<WidgetConfigInterface>;

  abstract getWidgetSettingsById(businessId: string, checkoutId: string, widgetId: string): Observable<WidgetConfigInterface>;

  abstract createWidgetSettings(businessId: string, data: WidgetConfigInterface): Observable<WidgetConfigInterface>;

  abstract saveWidgetSettings(businessId: string, widgetId: string, data: WidgetConfigInterface): Observable<WidgetConfigInterface>;

  abstract deleteWidgetSettings(businessId: string, widgetId: string): Observable<void>;

  abstract getBusiness(businessId: string): Observable<BusinessInterface>;

  abstract getSantanderDkProductsEx(businessId: string, channelSet: string): Observable<SantanderDkProductInterface[]>;

  abstract getDefaultConnection(channelSet: string, paymentType: string): Observable<DefaultConnectionInterface>;

  abstract getChannelSets(businessId: string): Observable<CheckoutChannelSetInterface[]>;

  abstract getConnectIntegrationInfo(businessId: string, integrationId: string): Observable<IntegrationConnectInfoInterface>;

  abstract getPaymentOptions(currency: string): Observable<PaymentOptionsInterface[]>;
}
