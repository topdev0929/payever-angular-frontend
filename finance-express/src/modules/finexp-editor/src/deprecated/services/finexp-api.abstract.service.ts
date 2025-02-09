import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { SantanderDkStoreProductDataInterface } from '@pe/connect-app';

import {
  CheckoutChannelSetInterface,
  IntegrationInfoInterface,
  CheckoutInterface,
  SectionAvailableInterface,
  BaseWidgetSettingsInterface,
  WidgetType,
  BusinessInterface,
  InstalledConnectionInterface,
  CheckoutConnectionInterface,
  IntegrationConnectInfoInterface
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

  abstract getWidgetSettings<T extends BaseWidgetSettingsInterface>(channelSetId: string, widgetType: WidgetType): Observable<{ data: T }>;

  abstract saveWidgetSettings<T extends BaseWidgetSettingsInterface>(channelSetId: string, widgetType: WidgetType, data: T): Observable<T>;

  abstract getBusiness(businessId: string): Observable<BusinessInterface>;

  abstract getSantanderDkProducts(businessId: string): Observable<SantanderDkStoreProductDataInterface[]>;

  abstract getChannelSets(businessId: string): Observable<CheckoutChannelSetInterface[]>;

  abstract getConnectIntegrationInfo(businessId: string, integrationId: string): Observable<IntegrationConnectInfoInterface>;
}
