import { Inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, combineLatest, Observable, of, throwError } from 'rxjs';
import { take, catchError, flatMap, map, filter } from 'rxjs/operators';
import { forEach } from 'lodash-es';

import { PE_ENV, EnvironmentConfigInterface as EnvInterface } from '@pe/common';
import { TranslateService } from '@pe/i18n';
import { SnackBarService } from '@pe/forms';

import {
  IntegrationCategory,
  CheckoutChannelSetInterface,
  CheckoutInterface,
  CheckoutSettingsInterface,
  InstalledConnectionInterface,
  CheckoutConnectionInterface,
  IntegrationInfoInterface,
  SectionAvailableInterface,
  UserBusinessInterface
} from '../../../modules/finexp-editor/src/deprecated/interfaces';
import { FinexpApiService } from './finexp-api.service';
import { FinexpStorageAbstractService } from '../../../modules/finexp-editor/src/deprecated/services';
import { BusinessInterface, SantanderDkProductInterface, PaymentOptionsInterface } from '../../../modules/finexp-editor/src/interfaces';

@Injectable({
  providedIn: 'root'
})
export class FinexpStorageService implements FinexpStorageAbstractService {

  private checkoutsSubject: BehaviorSubject<CheckoutInterface[]> = new BehaviorSubject<CheckoutInterface[]>(null);
  private checkoutsProcessed: boolean = false;
  private checkoutsBusinessUuid: string = null;

  private integrationsInfoSubject: BehaviorSubject<IntegrationInfoInterface[]> = new BehaviorSubject<IntegrationInfoInterface[]>(null);
  private integrationsInfoProcessed: boolean = false;
  private integrationsInfoBusinessUuid: string = null;

  private businessConnectionsSubject: BehaviorSubject<CheckoutConnectionInterface[]> = new BehaviorSubject<CheckoutConnectionInterface[]>(null);
  private businessConnectionsProcessed: boolean = false;
  private businessConnectionsBusinessUuid: string = null;

  private installedConnectionsSubject: BehaviorSubject<InstalledConnectionInterface[]> = new BehaviorSubject<InstalledConnectionInterface[]>(null);
  private installedConnectionsProcessed: boolean = false;
  private installedConnectionsBusinessUuid: string = null;

  private installedCheckoutConnectionsSubject: BehaviorSubject<InstalledConnectionInterface[]> = new BehaviorSubject<InstalledConnectionInterface[]>(null);
  private installedCheckoutConnectionsProcessed: boolean = false;
  private installedCheckoutConnectionsBusinessUuid: string = null;

  private channelSetsSubject: BehaviorSubject<CheckoutChannelSetInterface[]> = new BehaviorSubject<CheckoutChannelSetInterface[]>(null);
  private channelSetsProcessed: boolean = false;
  private channelSetsBusinessUuid: string = null;

  private currencySubject: BehaviorSubject<string> = new BehaviorSubject<string>(null);
  private currencyProcessed: boolean = false;

  private paymentsOptionsSubject: BehaviorSubject<PaymentOptionsInterface[]> = new BehaviorSubject<PaymentOptionsInterface[]>(null);
  private paymentsOptionsProcessed: boolean = false;

  private enabledIntergrations: {[key: string]: {
      businessUuid: string,
      subject: BehaviorSubject<string[]>,
      processed: boolean
    }} = {};

  constructor(
    @Inject(PE_ENV) private env: EnvInterface,
    private apiService: FinexpApiService,
    private http: HttpClient,
    private translateService: TranslateService,
    private snackBarService: SnackBarService
  ) {}

  get businessUuid(): string {
    const data = window.location.pathname.split('/');
    return data[2];
  }

  getHomeSettingsUrl(checkoutUuid: string): string {
    return `business/${this.businessUuid}/checkout/${checkoutUuid}/panel-settings`;
  }

  getHomeChannelsUrl(checkoutUuid: string): string {
    return `business/${this.businessUuid}/checkout/${checkoutUuid}/panel-channels`;
  }

  getConnectAppUrl(): string {
    return `business/${this.businessUuid}/connect`;
  }

  getCheckouts(reset: boolean = false): Observable<CheckoutInterface[]> {
    if (!this.checkoutsProcessed || this.businessUuid !== this.checkoutsBusinessUuid || reset) {
      this.checkoutsBusinessUuid = this.businessUuid;
      this.checkoutsProcessed = true;
      this.checkoutsSubject.next(null);

      this.apiService.getCheckouts(this.businessUuid).pipe(
        catchError((error: any) => {
          return of([]);
        })
      ).subscribe((data: CheckoutInterface[]) => this.checkoutsSubject.next(data));
    }
    return this.checkoutsSubject.asObservable();
  }

  getCheckoutSectionsAvailable(checkoutUuid: string): Observable<SectionAvailableInterface[]> {
    return this.apiService.getCheckoutSectionsAvailable(this.businessUuid, checkoutUuid);
  }

  getUserBusiness(): Observable<UserBusinessInterface> {
    return this.apiService.getUserBusiness(this.businessUuid);
  }

  getCheckoutById(id: string, reset: boolean = false): Observable<CheckoutInterface> {
    return this.getCheckouts(reset).pipe(
      map(checkouts => {
        const result = checkouts ? (checkouts.find(checkout => checkout._id === id || (checkout as any).checkoutId === id)) : null;
        if (!result && checkouts) {
          console.error('Cant find checkout in list', id, checkouts);
        }
        return result;
      })
    );
  }

  getCheckoutByChannelSetId(channelSetId: string): Observable<CheckoutInterface> {
    return combineLatest(
      this.getChannelSets().pipe(filter(channelSets => !!channelSets)),
      this.getCheckouts().pipe(filter(checkouts => !!checkouts))
    )
      .pipe(map(([channelSets, checkouts]) => {
        let checkout: CheckoutInterface;
        if (channelSets && checkouts) {
          const channelSet: CheckoutChannelSetInterface = (channelSets as CheckoutChannelSetInterface[])
            .find(_channelSet => _channelSet.id === channelSetId);
          if (channelSet) {
            checkout = (checkouts as CheckoutInterface[]).find(_checkout => _checkout._id === channelSet.checkout);
          }
        }
        return checkout;
      }));
  }

  getDefaultCheckout(reset: boolean = false): Observable<CheckoutInterface> {
    return this.getCheckouts(reset).pipe(
      map(checkouts => checkouts ? (checkouts.find(checkout => checkout.default) || checkouts[0]) : null)
    );
  }

  getDefaultCheckoutOnce(reset: boolean = false): Observable<CheckoutInterface> {
    return this.getDefaultCheckout(reset).pipe(filter(d => !!d), take(1));
  }

  getIntegrationsInfoOnce(reset: boolean = false): Observable<IntegrationInfoInterface[]> {
    return this.getIntegrationsInfo(reset).pipe(filter(d => !!d), take(1));
  }

  getIntegrationInfoOnce(name: string, reset: boolean = false): Observable<IntegrationInfoInterface> {
    return this.getIntegrationInfo(name, reset).pipe(filter(d => !!d), take(1));
  }

  getCheckoutByIdOnce(id: string, reset: boolean = false): Observable<CheckoutInterface> {
    return this.getCheckoutById(id, reset).pipe(this.catchErrorPipe(), filter(d => !!d), take(1));
  }

  getCheckoutsOnce(reset: boolean = false): Observable<CheckoutInterface[]> {
    return this.getCheckouts(reset).pipe(filter(d => !!d), take(1));
  }

  makeCreateCheckoutLink(checkoutId: string, channelSetId: string): string {
    return `${this.env.frontend.checkoutWrapper}/pay/create-flow/channel-set-id/${channelSetId}`;
  }

  saveCheckout(checkoutId: string, data: CheckoutInterface): Observable<CheckoutInterface> {
    const businessUuid = this.businessUuid;
    return this.apiService.saveCheckout(businessUuid , checkoutId, data).pipe(
      this.catchErrorPipe(),
      flatMap(newData => {
        return combineLatest(
          this.getCheckoutsOnce(true),
          this.getIntegrationsInfoOnce(true),
          this.getChannelSetsOnce(true)
        ).pipe(map(() => {
          return newData;
        }));
      })
    );
  }

  saveCheckoutSettings(checkoutId: string, data: CheckoutSettingsInterface): Observable<CheckoutInterface> {
    return this.saveCheckout(checkoutId, { settings: data });
  }

  saveCheckoutSections(checkoutId: string, sections: any): Observable<CheckoutInterface> { // TODO Replace any
    return this.saveCheckout(checkoutId, { sections: sections });
  }

  setDefaultCheckout(checkoutId: string): Observable<void> {
    const businessUuid = this.businessUuid;
    return this.apiService.setDefaultCheckout(businessUuid, checkoutId).pipe(this.catchErrorPipe(), flatMap(data => {
      return this.getCheckoutsOnce(true).pipe(map(() => {
        return null;
      }));
    }));
  }

  addNewCheckout(newCheckout: CheckoutInterface): Observable<CheckoutInterface> {
    const businessUuid = this.businessUuid;
    return this.apiService.addNewCheckout(businessUuid, newCheckout).pipe(this.catchErrorPipe(), flatMap(data => {
      return combineLatest(this.getCheckoutsOnce(true), this.getIntegrationsInfoOnce(true), this.getChannelSetsOnce(true)).pipe(map(() => {
        return data;
      }));
    }));
  }

  getIntegrationsInfo(reset: boolean = false): Observable<IntegrationInfoInterface[]> {
    if (!this.integrationsInfoProcessed || this.businessUuid !== this.integrationsInfoBusinessUuid || reset) {
      this.integrationsInfoBusinessUuid = this.businessUuid;
      this.integrationsInfoProcessed = true;
      this.integrationsInfoSubject.next(null);

      this.apiService.getIntegrationsInfo(this.businessUuid).pipe(this.catchErrorPipe())
        .subscribe((data: IntegrationInfoInterface[]) => this.integrationsInfoSubject.next(data));
    }
    return this.integrationsInfoSubject.asObservable();
  }

  getCategoryInstalledIntegrationsInfo(
    category: IntegrationCategory | IntegrationCategory[],
    reset: boolean = false
  ): Observable<IntegrationInfoInterface[]> {
    const categories = category instanceof Array ? category : [category];
    return this.getIntegrationsInfo(reset).pipe(map(data => {
      if (data) {
        data = data.filter(item => item.installed && categories.indexOf(item.integration.category) >= 0);
      }
      return data;
    }));
  }

  getIntegrationInfo(name: string, reset: boolean = false): Observable<IntegrationInfoInterface> {
    return this.getIntegrationsInfo(reset).pipe(map(data => {
      let result: IntegrationInfoInterface = null;
      if (data) {
        result = data.find(item => item.integration.name === name);
      }
      return result;
    }));
  }

  getCheckoutEnabledIntegrations(checkoutId: string, reset: boolean = false): Observable<string[]> {
    if (!this.enabledIntergrations[checkoutId]) {
      this.enabledIntergrations[checkoutId] = {
        businessUuid: null,
        subject: new BehaviorSubject<string[]>(null),
        processed: false
      };
    }
    const ref = this.enabledIntergrations[checkoutId];
    if (!ref.processed || reset || ref.businessUuid !== this.businessUuid) {
      ref.businessUuid = this.businessUuid;
      ref.processed = true;
      ref.subject.next(null);

      this.apiService.getCheckoutEnabledIntegrations(this.businessUuid, checkoutId).subscribe(data => {
        ref.subject.next(data);
      });
    }
    return ref.subject.asObservable();
  }

  toggleCheckoutIntegration(checkoutId: string, integrationName: string, enable: boolean): Observable<void> {
    const businessUuid = this.businessUuid;
    return this.apiService.toggleCheckoutIntegration(
      businessUuid, checkoutId, integrationName, enable
    ).pipe(this.catchErrorPipe(), flatMap(data => {
      return this.getCheckoutEnabledIntegrations(checkoutId, true).pipe(filter(d => !!d), take(1), map(() => {
        return null;
      }));
    }));
  }

  getInstalledConnections(reset: boolean = false): Observable<InstalledConnectionInterface[]> {
    if (!this.installedConnectionsProcessed || this.businessUuid !== this.installedConnectionsBusinessUuid || reset) {
      this.installedConnectionsBusinessUuid = this.businessUuid;
      this.installedConnectionsProcessed = true;
      this.installedConnectionsSubject.next(null);

      this.apiService.getInstalledConnections(this.businessUuid).pipe(this.catchErrorPipe())
        .subscribe((data: CheckoutConnectionInterface[]) => {
          this.installedConnectionsSubject.next(data);
        });
    }
    return this.installedConnectionsSubject.asObservable();
  }

  getInstalledCheckoutConnections(checkoutId: string, reset: boolean = false): Observable<InstalledConnectionInterface[]> {
    if (!this.installedCheckoutConnectionsProcessed || this.businessUuid !== this.installedCheckoutConnectionsBusinessUuid || reset) {
      this.installedCheckoutConnectionsBusinessUuid = this.businessUuid;
      this.installedCheckoutConnectionsProcessed = true;
      this.installedCheckoutConnectionsSubject.next(null);

      this.apiService.getInstalledCheckoutConnections(this.businessUuid, checkoutId).pipe(this.catchErrorPipe())
        .subscribe((data: CheckoutConnectionInterface[]) => {
          this.installedCheckoutConnectionsSubject.next(data);
        });
    }
    return this.installedCheckoutConnectionsSubject.asObservable();
  }

  getBusinessConnections(reset: boolean = false): Observable<CheckoutConnectionInterface[]> {
    if (!this.businessConnectionsProcessed || this.businessUuid !== this.businessConnectionsBusinessUuid || reset) {
      this.businessConnectionsBusinessUuid = this.businessUuid;
      this.businessConnectionsProcessed = true;
      this.businessConnectionsSubject.next(null);

      this.apiService.getBusinessConnections(this.businessUuid).pipe(this.catchErrorPipe())
        .subscribe((data: CheckoutConnectionInterface[]) => {
          this.businessConnectionsSubject.next(data);
        });
    }
    return this.businessConnectionsSubject.asObservable();
  }

  getPaymentOptions(currency: string, reset: boolean = false): Observable<PaymentOptionsInterface[]> {
    if (!this.paymentsOptionsProcessed || reset) {
      this.paymentsOptionsProcessed = true;
      this.paymentsOptionsSubject.next(null);

      this.apiService.getPaymentOptions(currency).pipe(this.catchErrorPipe())
        .subscribe((data: PaymentOptionsInterface[]) => {
          forEach(data, d => {
            // Backend returns limit in wrong format, like 13.34513, so we have to transform into 13.34
            if (d.min) {
              d.min = Math.ceil(d.min * 100.0) / 100.0;
            }
            if (d.max) {
              d.max = Math.floor(d.max * 100.0) / 100.0;
            }
          });
          return this.paymentsOptionsSubject.next(data);
        });
    }
    return this.paymentsOptionsSubject.asObservable();
  }

  getCurrencyByChannelSetId(channelSetId: string, reset: boolean = false): Observable<string> {
    if (!this.currencyProcessed || reset) {
      this.currencyProcessed = true;
      this.currencySubject.next(null);

      this.apiService.getCurrencyByChannelSetId(channelSetId).pipe(this.catchErrorPipe())
        .subscribe((data: string) => this.currencySubject.next(data));
    }
    return this.currencySubject.asObservable();
  }

  getChannelSets(reset: boolean = false): Observable<CheckoutChannelSetInterface[]> {
    if (!this.channelSetsProcessed || this.businessUuid !== this.channelSetsBusinessUuid || reset) {
      this.channelSetsBusinessUuid = this.businessUuid;
      this.channelSetsProcessed = true;
      this.channelSetsSubject.next(null);

      this.apiService.getChannelSets(this.businessUuid).pipe(this.catchErrorPipe())
        .subscribe((data: CheckoutChannelSetInterface[]) => this.channelSetsSubject.next(data));
    }
    return this.channelSetsSubject.asObservable();
  }

  getChannelSetsForCheckout(checkoutId: string, reset: boolean = false): Observable<CheckoutChannelSetInterface[]> {
    // TODO Better to use this.apiService.getCheckoutChannelSets() instead to avoid filtering
    return this.getChannelSets(reset).pipe(map(d => {
      return d ? d.filter(item => item.checkout === checkoutId) : null
    }));
  }

  // tslint:disable:max-line-length
  getChannelSetsForCheckoutByType(checkoutId: string, channelType: string, reset: boolean = false): Observable<CheckoutChannelSetInterface[]> {
    return this.getChannelSetsForCheckout(checkoutId, reset).pipe(map(d => {
      return d ? d.filter(item => item.type === channelType) : null;
    }));
  }

  getChannelSetsOnce(reset: boolean = false): Observable<CheckoutChannelSetInterface[]> {
    return this.getChannelSets(reset).pipe(filter(d => !!d), take(1));
  }

  getChannelSetsForCheckoutByTypeOnce(checkoutId: string, channelType: string, reset: boolean = false): Observable<CheckoutChannelSetInterface[]> {
    return this.getChannelSetsForCheckoutByType(checkoutId, channelType, reset).pipe(filter(d => !!d), take(1));
  }

  attachChannelSetToCheckout(channelSetId: string, checkoutId: string): Observable<void> {
    return this.apiService.attachChannelSetToCheckout(
      this.businessUuid, channelSetId, checkoutId
    ).pipe(this.catchErrorPipe(), flatMap(data => {
      return this.getChannelSets(true).pipe(filter(d => !!d), take(1), map(() => {
        return null;
      }));
    }));
  }

  getBusiness(reset: boolean = false): Observable<BusinessInterface> {
    return this.apiService.getBusiness(this.businessUuid);
  }

  getSantanderDkProductsEx(channelSet: string, reset: boolean = false): Observable<SantanderDkProductInterface[]> {
    return this.apiService.getSantanderDkProductsEx(this.businessUuid, channelSet);
  }

  isChannelSetAttached(channelSets: CheckoutChannelSetInterface[], channelSetId: string, channelSetType: string, checkoutId: string): boolean {
    if (channelSets && channelSetId && channelSetType && checkoutId) {
      return channelSets.some((channelSet: CheckoutChannelSetInterface) => {
        return channelSet.id === channelSetId && channelSet.type === channelSetType && channelSet.checkout === checkoutId;
      });
    }
    return false;
  }

  private catchErrorPipe(): any {
    return catchError((error: any) => {
      if (error.status === 403) {
        error.message = this.translateService.translate('errors.forbidden');
      }
      return throwError(error);
    });
  }

  showError(error: string): void {
    this.snackBarService.toggle(true, error || 'Unknown error', {
      duration: 5000,
      iconId: 'icon-alert-24',
      iconSize: 24
    });
  }
}
