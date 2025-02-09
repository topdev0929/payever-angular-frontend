import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import {
  BusinessInterface,
  SantanderDkProductInterface,
  CheckoutInterface,
  IntegrationCategory,
  PaymentOptionsInterface,
  IntegrationInfoInterface,
  CheckoutSettingsInterface,
  SectionAvailableInterface,
  CheckoutConnectionInterface,
  CheckoutChannelSetInterface,
  InstalledConnectionInterface
} from '../interfaces';

@Injectable()
export abstract class FinexpStorageAbstractService {

  public businessUuid: string;

  abstract getHomeSettingsUrl(checkoutUuid: string): string ;

  abstract getHomeChannelsUrl(checkoutUuid: string): string;

  abstract getCheckouts(reset?: boolean): Observable<CheckoutInterface[]>;

  abstract getCheckoutSectionsAvailable(checkoutUuid: string): Observable<SectionAvailableInterface[]>;

  abstract getCheckoutByChannelSetId(channelSetId: string): Observable<CheckoutInterface>;

  abstract getIntegrationsInfoOnce(reset?: boolean): Observable<IntegrationInfoInterface[]>;

  abstract getCheckoutByIdOnce(id: string, reset?: boolean): Observable<CheckoutInterface>;

  abstract getCheckoutsOnce(reset?: boolean): Observable<CheckoutInterface[]>;

  abstract makeCreateCheckoutLink(checkoutId: string, channelSetId: string): string;

  abstract saveCheckout(checkoutId: string, data: CheckoutInterface): Observable<CheckoutInterface>;

  abstract saveCheckoutSettings(checkoutId: string, data: CheckoutSettingsInterface): Observable<CheckoutInterface>;

  abstract saveCheckoutSections(checkoutId: string, sections: any): Observable<CheckoutInterface>;

  abstract getIntegrationsInfo(reset?: boolean): Observable<IntegrationInfoInterface[]>;

  abstract getInstalledConnections(reset?: boolean): Observable<InstalledConnectionInterface[]>;

  abstract getInstalledCheckoutConnections(checkoutId: string, reset?: boolean): Observable<InstalledConnectionInterface[]>;

  abstract getBusinessConnections(reset?: boolean): Observable<CheckoutConnectionInterface[]>;

  abstract getCurrencyByChannelSetId(channelSetId: string, reset?: boolean): Observable<string>;

  abstract getPaymentOptions(currency: string, reset?: boolean): Observable<PaymentOptionsInterface[]>;

  abstract getChannelSetsForCheckout(checkoutId: string, reset?: boolean): Observable<CheckoutChannelSetInterface[]>;

  abstract getCategoryInstalledIntegrationsInfo(category: IntegrationCategory | IntegrationCategory[], reset?: boolean): Observable<IntegrationInfoInterface[]>;

  abstract getChannelSetsOnce(reset?: boolean): Observable<CheckoutChannelSetInterface[]>;

  abstract attachChannelSetToCheckout(channelSetId: string, checkoutId: string): Observable<void>;

  abstract isChannelSetAttached(channelSets: CheckoutChannelSetInterface[], channelSetId: string, channelSetType: string, checkoutId: string): boolean;

  abstract showError(error: string): void;

  abstract getBusiness(reset?: boolean): Observable<BusinessInterface>;

  abstract getSantanderDkProductsEx(channelSetId: string, reset?: boolean): Observable<SantanderDkProductInterface[]>;
}
