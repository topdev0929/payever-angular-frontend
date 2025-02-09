import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import {
  IntegrationCategory,
  CheckoutChannelSetInterface,
  CheckoutInterface,
  CheckoutSettingsInterface,
  InstalledConnectionInterface,
  CheckoutConnectionInterface,
  IntegrationInfoInterface,
  SectionAvailableInterface,
  UserBusinessInterface,
} from '../interfaces';

@Injectable()
export abstract class FinexpStorageAbstractService {

  public businessUuid: string;

  abstract getHomeSettingsUrl(checkoutUuid: string): string ;

  abstract getHomeChannelsUrl(checkoutUuid: string): string;

  abstract getConnectAppUrl(): string;

  abstract getCheckouts(reset?: boolean): Observable<CheckoutInterface[]>;

  abstract getCheckoutSectionsAvailable(checkoutUuid: string): Observable<SectionAvailableInterface[]>;

  abstract getCheckoutById(id: string, reset?: boolean): Observable<CheckoutInterface>;

  abstract getCheckoutByChannelSetId(channelSetId: string): Observable<CheckoutInterface>;

  abstract getDefaultCheckout(reset?: boolean): Observable<CheckoutInterface>;

  abstract getDefaultCheckoutOnce(reset?: boolean): Observable<CheckoutInterface>;

  abstract getIntegrationsInfoOnce(reset?: boolean): Observable<IntegrationInfoInterface[]>;

  abstract getIntegrationInfoOnce(name: string, reset?: boolean): Observable<IntegrationInfoInterface>;

  abstract getCheckoutByIdOnce(id: string, reset?: boolean): Observable<CheckoutInterface>;

  abstract getCheckoutsOnce(reset?: boolean): Observable<CheckoutInterface[]>;

  abstract makeCreateCheckoutLink(checkoutId: string, channelSetId: string): string;

  abstract saveCheckout(checkoutId: string, data: CheckoutInterface): Observable<CheckoutInterface>;

  abstract saveCheckoutSettings(checkoutId: string, data: CheckoutSettingsInterface): Observable<CheckoutInterface>;

  abstract saveCheckoutSections(checkoutId: string, sections: any): Observable<CheckoutInterface>;

  abstract setDefaultCheckout(checkoutId: string): Observable<void>;

  abstract addNewCheckout(newCheckout: CheckoutInterface): Observable<CheckoutInterface>;

  abstract getIntegrationsInfo(reset?: boolean): Observable<IntegrationInfoInterface[]>;

  abstract getCheckoutEnabledIntegrations(checkoutId: string, reset?: boolean): Observable<string[]>;

  abstract getIntegrationInfo(name: string, reset?: boolean): Observable<IntegrationInfoInterface>;

  abstract getInstalledConnections(reset?: boolean): Observable<InstalledConnectionInterface[]>;

  abstract getBusinessConnections(reset?: boolean): Observable<CheckoutConnectionInterface[]>;

  abstract getCurrencyByChannelSetId(channelSetId: string, reset?: boolean): Observable<string>;

  abstract getChannelSets(reset?: boolean): Observable<CheckoutChannelSetInterface[]>;

  abstract toggleCheckoutIntegration(checkoutId: string, integrationName: string, enable: boolean): Observable<void>;

  abstract getChannelSetsForCheckout(checkoutId: string, reset?: boolean): Observable<CheckoutChannelSetInterface[]>;

  // tslint:disable:max-line-length
  abstract getChannelSetsForCheckoutByType(checkoutId: string, channelType: string, reset?: boolean): Observable<CheckoutChannelSetInterface[]>;

  abstract getCategoryInstalledIntegrationsInfo(category: IntegrationCategory | IntegrationCategory[], reset?: boolean): Observable<IntegrationInfoInterface[]>;

  abstract getChannelSetsOnce(reset?: boolean): Observable<CheckoutChannelSetInterface[]>;

  abstract getChannelSetsForCheckoutByTypeOnce(checkoutId: string, channelType: string, reset?: boolean): Observable<CheckoutChannelSetInterface[]>;

  abstract attachChannelSetToCheckout(channelSetId: string, checkoutId: string): Observable<void>;

  abstract isChannelSetAttached(channelSets: CheckoutChannelSetInterface[], channelSetId: string, channelSetType: string, checkoutId: string): boolean;

  abstract getUserBusiness(): Observable<UserBusinessInterface>;

  abstract showError(error: string): void;
}
