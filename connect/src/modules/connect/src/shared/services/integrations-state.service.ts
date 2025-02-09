import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { catchError, filter, flatMap, take, map, mergeMap } from 'rxjs/operators';
import { cloneDeep, forEach } from 'lodash-es';

import { PeSearchItem } from '@pe/common';

import {
  IntegrationCategory,
  IntegrationShortStatusInterface,
  IntegrationInfoWithStatusInterface,
  UserBusinessInterface,
  PaymentMethodEnum,
  IntegrationReviewInterface,
  IntegrationVersionInterface,
} from '../interfaces';
import { BusinessService } from './business.service';
import { IntegrationsApiService } from './integrations-api.service';

export declare interface PaymentStateServiceInterface {
  enableOptionByPaymentMethod(paymentMethod: PaymentMethodEnum): Observable<void>;

  resetCredentailsByPaymentMethod(paymentMethod: PaymentMethodEnum): Observable<void>;
}

@Injectable()
export class IntegrationsStateService {

  private business: string;
  private categoryIntergrations: {
    [key: string]: {
      subject: BehaviorSubject<IntegrationInfoWithStatusInterface[]>,
      processed: boolean
    }
  } = {};
  private intergrations: {
    [key: string]: {
      subject: BehaviorSubject<IntegrationInfoWithStatusInterface>,
      processed: boolean
    }
  } = {};

  private subscriptionsTotal: number;
  private subscriptionsPageLimit: number = 12;

  constructor(
    private businessService: BusinessService,
    private integrationApiService: IntegrationsApiService
  ) {
  }

  resetFlowOfCategoryIntegrations(active: boolean, category: IntegrationCategory): void {
    const key = `${active}|${category}`;
    if (this.categoryIntergrations[key]) {
      this.categoryIntergrations[key].processed = false;
    }
  }

  getCategoryIntegrations(
    active: boolean,
    categories: IntegrationCategory[] = [],
    reset: boolean = false,
    page = 1,
    searchFilters: PeSearchItem[] = [],
  ): Observable<IntegrationInfoWithStatusInterface[]> {
    const business = this.businessService.getBusinessId();
    if (this.business !== business) {
      this.business = business;
    }

    return this.integrationApiService.getCategoryIntegrationStatuses(
      this.business,
      active,
      categories,
      searchFilters,
      page,
      this.subscriptionsPageLimit
    )
      .pipe(map(
        ({integrations, total}) => {
          this.subscriptionsTotal = total;
          const result: IntegrationInfoWithStatusInterface[] = [];
          forEach(integrations, integration => {
            const final = cloneDeep(integration.integration) as IntegrationInfoWithStatusInterface;
            final._status = {installed: integration.installed};
            final.subscriptionId = integration._id;
            result.push(final);
          });
          return result;
        }
      ));
  }

  getIntegration(name: string, reset: boolean = false): Observable<IntegrationInfoWithStatusInterface> {
    const business = this.businessService.getBusinessId();
    if (this.business !== business) {
      this.business = business;
      this.intergrations = {};
    }

    if (!this.intergrations[name]) {
      this.intergrations[name] = {
        subject: new BehaviorSubject<IntegrationInfoWithStatusInterface>(null),
        processed: false
      };
    }
    const ref = this.intergrations[name];
    if (!ref.processed || reset) {
      ref.processed = true;
      ref.subject.next(null);

      let integrInfo: IntegrationInfoWithStatusInterface = null;
      this.integrationApiService.getIntegrationInfo(name).pipe(
        flatMap((info: IntegrationInfoWithStatusInterface) => {
          integrInfo = info;
          return this.integrationApiService.getIntegrationStatus(this.business, name);
        })
      ).subscribe(shortStatus => {
        const final = cloneDeep(integrInfo) as IntegrationInfoWithStatusInterface;
        final._status = {} as any;
        final._status.installed = shortStatus.installed;
        ref.subject.next(final);
      });
    }
    return ref.subject.asObservable();
  }

  getIntegrationOnce(name: string, reset: boolean = false): Observable<IntegrationInfoWithStatusInterface> {
    return this.getIntegration(name, reset).pipe(filter(d => !!d), take(1));
  }

  getFolderIntegrations(folderId: string, searchFilters: PeSearchItem[] = []): Observable<IntegrationInfoWithStatusInterface[]> {
    return this.integrationApiService.getCustomFolderIntegrations(this.getBusinessId(), folderId, searchFilters)
      .pipe(map(
        (integrations) => {
          this.subscriptionsTotal = integrations.length;
          const result: IntegrationInfoWithStatusInterface[] = [];
          forEach(integrations, integration => {
            const final = cloneDeep(integration.integration) as IntegrationInfoWithStatusInterface;
            final._status = {installed: integration.installed};
            final.subscriptionId = integration._id;
            result.push(final);
          });
          return result;
        }
      ));
  }

  // TODO SPLIT UP INSTALL AND UNINSTALL!!!
  installIntegration(
    name: string, paymentsStateService: PaymentStateServiceInterface, install: boolean = true
  ): Observable<IntegrationShortStatusInterface> {
    const business = this.businessService.getBusinessId();
    return this.integrationApiService.installIntegration(business, name, install).pipe(
      flatMap(data => {
        return this.getIntegration(name, true).pipe(filter(d => !!d), take(1), flatMap((info: IntegrationInfoWithStatusInterface) => {

          let result = of(null);
          if (info.category === IntegrationCategory.Payments) {
            // Hacks for payments
            // if (info._status.installed && info.name === 'cash') {
            //   result = paymentsStateService.enableOptionByPaymentMethod(info.name as any);
            // }
          }
          return result.pipe(flatMap(() => {
            // In case of resetFlowOfCategoryIntegrations we don't update flow right now but it will be updated on next subscribe()
            this.resetFlowOfCategoryIntegrations(false, info.category);
            this.resetFlowOfCategoryIntegrations(true, info.category);
            return of(data);
            /*
            return this.getCategoryIntegrations(false, info.category, true).pipe(filter(d => !!d), take(1), mergeMap(() => {
              return this.getCategoryIntegrations(true, info.category, true).pipe(filter(d => !!d), take(1), map(() => {
                return data;
              }));
            }));*/
          }));
        }));
      })
    );
  }

  getBusinessId(): string {
    return this.businessService.getBusinessId();
  }

  getSubscriptionsTotal(): number {
    return this.subscriptionsTotal;
  }

  setSubscriptionsLimit(limit: number): number {
    return this.subscriptionsPageLimit = limit;
  }

  getUserBusinessesList(): Observable<UserBusinessInterface> {
    return this.businessService.getUserBusinessesList().pipe(catchError(() => []), map(data => data.business));
  }

  getUserBusinesses(): Observable<UserBusinessInterface> {
    return this.getUserBusinessesList();
  }

  getUserBusinessesOnce(reset: boolean = false): Observable<UserBusinessInterface> {
    return this.getUserBusinesses().pipe(filter(d => !!d), take(1));
  }

  saveUserBusinesses(data: UserBusinessInterface): Observable<void> {
    const business = this.businessService.getBusinessId();
    return this.businessService.saveUserBusinesses(business, data).pipe(map(result => {
      this.getUserBusinessesOnce(true).pipe(map(() => {
        return result;
      }));
    }));
  }

  addIntegrationReview(integrationName: string, review: IntegrationReviewInterface): Observable<void> {
    return this.integrationApiService.addIntegrationReview(integrationName, review).pipe(mergeMap(a => {
      return this.getIntegrationOnce(integrationName, true).pipe(map(() => a));
    }));
  }

  rateIntegration(integrationName: string, rating: number): Observable<void> {
    return this.integrationApiService.rateIntegration(integrationName, rating).pipe(mergeMap(a => {
      return this.getIntegrationOnce(integrationName, true).pipe(map(() => a));
    }));
  }

  getIntegrationVersions(integrationName: string): Observable<IntegrationVersionInterface[]> {
    return this.integrationApiService.getIntegrationVersions(integrationName);
  }
}

