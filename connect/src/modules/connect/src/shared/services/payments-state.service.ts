import { Injectable, Injector } from '@angular/core';
import { Params, Router } from '@angular/router';
import { forEach } from 'lodash-es';
import { BehaviorSubject, combineLatest, Observable, of, timer } from 'rxjs';
import { delay, filter, flatMap, take, map } from 'rxjs/operators';

import { TranslateService } from '@pe/i18n';
import { SnackbarService } from '@pe/snackbar';

import { IntegrationsStateService } from '../services/integrations-state.service';
import {
  VariantListItemInterface,
  BusinessInterface,
  MappedVariantListItemInterface,
  PaymentOptionExInterface,
  PaymentWithVariantInterface,
  StepInterface,
  SantanderDkStoreProductDataInterface,
  BusinessOptionConditionsInterface,
  PaymentPayloadInterface,
  StepEnum,
  UserBusinessInterface,
  PaymentMethodEnum,
  STEP_UPLOAD_TYPES,
  STEP_UPLOAD_TYPE_TO_OPTION_KEY,
  STEP_UPLOAD_TYPE_TO_BUSINESS_KEY,
  IntegrationCategory,
  IntegrationInfoWithStatusInterface, IntegrationShortStatusInterface
} from '../interfaces';
import { PaymentsApiService } from './payments-api.service';

@Injectable()
export class PaymentsStateService {

  readonly externalRegPrefix = 'pe_connectapp_externalregfilled_';

  private businessSubject: BehaviorSubject<BusinessInterface> = new BehaviorSubject<BusinessInterface>(null);
  private businessProcessed: boolean = false;
  private lastBusinessUuid: string;

  private paymentOptionsSubject: BehaviorSubject<PaymentOptionExInterface[]> = new BehaviorSubject<PaymentOptionExInterface[]>(null);
  private paymentOptionsProcessed: boolean = false;

  private paymentsWithVariantSubject: BehaviorSubject<PaymentWithVariantInterface[]> = new BehaviorSubject<PaymentWithVariantInterface[]>(null);
  private paymentsWithVariantProcessed: boolean = false;
  private lastBusinessOfPaymentsWithVariant: string;

  private variantList: {
    [key: string]: {
      subject: BehaviorSubject<MappedVariantListItemInterface>,
      processed: boolean
    }
  } = {};

  private conditions: {
    [key: string]: {
      subject: BehaviorSubject<BusinessOptionConditionsInterface>,
      processed: boolean
    }
  } = {};

  private paymentPayloads: {
    [key: string]: {
      subject: BehaviorSubject<PaymentPayloadInterface>,
      processed: boolean
    }
  } = {};

  private integrationsStateService: IntegrationsStateService = this.injector.get(IntegrationsStateService);
  private paymentsApiService: PaymentsApiService = this.injector.get(PaymentsApiService);
  private translateService: TranslateService = this.injector.get(TranslateService);
  private router: Router = this.injector.get(Router);

  constructor(private injector: Injector) {
  }

  get snackBarService(): SnackbarService {
    return this.injector.get(SnackbarService);
  }

  getBusinessUuid(): string {
    const data = window.location.pathname.split('/'); // TODO get via activatedRoute.
    return data[2];
  }

  getUserBusiness(businessSlug: string, reset: boolean = false): Observable<BusinessInterface> {
    if (!this.businessProcessed || reset || this.lastBusinessUuid !== businessSlug) {
      this.businessProcessed = true;
      this.businessSubject.next(null);
      this.lastBusinessUuid = businessSlug;

      this.paymentsApiService.getUserBusiness(businessSlug).subscribe(
        (data: BusinessInterface) => this.businessSubject.next(data),
        () => {
          this.businessSubject.next({} as any);
          this.businessProcessed = false;
        }
      );
    }
    return this.businessSubject.asObservable();
  }

  getPaymentsWithVariant(reset: boolean = false): Observable<PaymentWithVariantInterface[]> {
    const businessUuid = this.integrationsStateService.getBusinessId();
    if (!this.paymentsWithVariantProcessed || reset || this.lastBusinessOfPaymentsWithVariant !== businessUuid) {
      this.paymentsWithVariantProcessed = true;
      this.paymentsWithVariantSubject.next(null);
      this.lastBusinessOfPaymentsWithVariant = businessUuid;

      combineLatest(
        this.getPaymentOptions(reset),
        this.getVariantList(businessUuid, reset),
      ).pipe(filter(data => !!data && !!data[0] && !!data[1])).subscribe(data => {
        const options: PaymentOptionExInterface[] = data[0];
        const variantList: MappedVariantListItemInterface = data[1];
        if (options && variantList) {
          const result: PaymentWithVariantInterface[] = [];
          forEach(options, option => {
            const variants = variantList[option.payment_method];
            if (variants) {
              result.push({
                businessUuid: businessUuid,
                option: option,
                missing_steps: variants.missing_steps,
                variants: variants.variants // TODO Rename variants to variants
              });
            }
          });
          this.paymentsWithVariantSubject.next(result);
        } else {
          this.paymentsWithVariantSubject.next([]);
        }
      });
    }
    return this.paymentsWithVariantSubject.asObservable();
  }

  reloadPaymentsWithVariant<T = null>(data: T = null): Observable<T> {
    return this.getPaymentsWithVariant(true).pipe(filter(d => !!d), take(1), map(() => {
      return data;
    }));
  }

  getPaymentWithVariant(paymentMethod: PaymentMethodEnum, reset: boolean = false): Observable<PaymentWithVariantInterface> {
    return this.getPaymentsWithVariant(reset).pipe(
      filter(payments => !!payments && payments.length > 0 && !!payments.find(option => option.option.payment_method === paymentMethod)),
      map(payments => {
        // Not fully correct but fine because because next request use only `data.variant.id`
        return payments.find(option => option.option.payment_method === paymentMethod);
      })
    );
  }

  getSantanderDkCredentialsStoreProductData(variant: VariantListItemInterface, storeId: string): Observable<SantanderDkStoreProductDataInterface[]> {
    return this.paymentsApiService.getSantanderDkCredentialsStoreProductData(variant, storeId);
  }

  createAccount<T>(data: T, variant: VariantListItemInterface): Observable<void> {
    return this.paymentsApiService.createAccount(data, variant).pipe(
      flatMap(() => this.reloadPaymentsWithVariant())
    );
  }

  saveCredentials<T>(data: T, payment: PaymentWithVariantInterface, variant: VariantListItemInterface): Observable<T> {
    return this.paymentsApiService.saveCredentials<T>(data, payment, variant).pipe(
      flatMap(() => {
        return this.enableOption(payment, variant).pipe(map(() => {
          return data;
        }));
      })
    );
  }

  enableOption(payment: PaymentWithVariantInterface, variant: VariantListItemInterface): Observable<void> {
    return this.paymentsApiService.enableOption(variant).pipe(
      flatMap(() => this.reloadPaymentsWithVariant())
    );
  }

  enableOptionByPaymentMethod(paymentMethod: PaymentMethodEnum): Observable<void> {
    return this.getPaymentWithVariant(paymentMethod).pipe(
      filter(d => !!d),
      take(1),
      flatMap((data: PaymentWithVariantInterface) => {
        return this.paymentsApiService.enableOptions(data.variants).pipe(
          flatMap(() => this.reloadPaymentsWithVariant())
        );
      })
    );
  }

  addConnectionVariant(paymentMethod: PaymentMethodEnum, name: string): Observable<void> {
    return this.paymentsApiService.addConnectionVariant(this.getBusinessUuid(), paymentMethod, name).pipe(
      flatMap(() => this.reloadPaymentsWithVariant())
    );
  }

  saveSettings<T>(data: T, payment: PaymentWithVariantInterface, variant: VariantListItemInterface): Observable<T> {
    return this.paymentsApiService.saveCredentials<T>(data, payment, variant).pipe(
      flatMap(() => this.reloadPaymentsWithVariant<T>(data))
    );
  }

  saveOptions<T>(data: T, variant: VariantListItemInterface): Observable<T> {
    return this.paymentsApiService.saveOptions<T>(data, variant).pipe(
      flatMap(() => this.reloadPaymentsWithVariant<T>(data))
    );
  }

  resetCredentails(payment: PaymentWithVariantInterface, variant: VariantListItemInterface): Observable<void> {
    return this.paymentsApiService.resetCredentails(payment, variant).pipe(
      flatMap(() => this.reloadPaymentsWithVariant())
    );
  }

  deleteConnectionVariant(payment: PaymentWithVariantInterface, variant: VariantListItemInterface): Observable<void> {
    return this.paymentsApiService.deleteConnectionVariant(payment, variant).pipe(
      flatMap(() => this.reloadPaymentsWithVariant())
    );
  }

  resetCredentailsByPaymentMethod(paymentMethod: PaymentMethodEnum): Observable<void> {
    return this.getPaymentWithVariant(paymentMethod).pipe(
      filter(d => !!d),
      take(1),
      flatMap((payment: PaymentWithVariantInterface) => {
        return combineLatest(payment.variants.map(variant => this.resetCredentails(payment, variant)));
      }),
      map(() => null)
    );
  }

  resetDocumentsByPaymentMethod(paymentMethod: PaymentMethodEnum): Observable<void> {
    const businessUuid: string = this.getBusinessUuid();
    // The rest files are resetted at BE
    return this.paymentsApiService.saveBusinessDocument(
      businessUuid,
      STEP_UPLOAD_TYPE_TO_BUSINESS_KEY['upload-commercial-excerpt'],
      null
    ).pipe(flatMap(() => {
      return this.getPaymentWithVariant(paymentMethod, true).pipe(
        filter(d => !!d),
        take(1),
        flatMap(() => this.getConnectPaymentPayload(paymentMethod, true)),
        // It returns empty so we can't filter
        take(1),
        map(() => null)
      );
    }));
  }

  saveDocument(payment: PaymentWithVariantInterface, paymentMethod: PaymentMethodEnum, type: StepEnum, blobName: string, fileName: string): Observable<void> {
    const businessUuid: string = this.getBusinessUuid();
    if (STEP_UPLOAD_TYPES.indexOf(type) < 0) {
      throw new Error('Invalid step for uploading!');
    }
    let businessDocument = false;
    let document = STEP_UPLOAD_TYPE_TO_OPTION_KEY[type];
    if (!document) {
      document = STEP_UPLOAD_TYPE_TO_BUSINESS_KEY[type];
      businessDocument = true;
    }
    const result = businessDocument ?
      this.paymentsApiService.saveBusinessDocument(businessUuid, document, blobName) :
      combineLatest(payment.variants.map(variant => this.paymentsApiService.saveOptionDocument(variant, document, blobName))).pipe(map(() => null));

    const documentName = this.translateService.translate(`categories.payments.documents.${type}`);
    return result.pipe(flatMap(() => {
      const payload = { documents: [] };
      payload.documents.push({ type: document, blobName, fileName: fileName, name: documentName });

      return combineLatest([
        this.saveConnectPaymentPayload(paymentMethod, payload),
        this.getPaymentsWithVariant(true),
      ]).pipe(map(() => null));
    }));
  }

  getConnectPaymentPayload(paymentMethod: PaymentMethodEnum, reset: boolean = false): Observable<PaymentPayloadInterface> {
    if (!this.paymentPayloads[paymentMethod]) {
      this.paymentPayloads[paymentMethod] = {
        subject: new BehaviorSubject<PaymentPayloadInterface>(null),
        processed: false
      };
    }
    if (!this.paymentPayloads[paymentMethod].processed || reset) {
      this.paymentPayloads[paymentMethod].processed = true;
      this.paymentPayloads[paymentMethod].subject.next(null);

      this.paymentsApiService.getConnectPaymentPayload(this.getBusinessUuid(), paymentMethod).subscribe((data: PaymentPayloadInterface) => {
        this.paymentPayloads[paymentMethod].subject.next(data);
      });
    }
    return this.paymentPayloads[paymentMethod].subject.asObservable();
  }

  saveConnectPaymentPayload(paymentMethod: PaymentMethodEnum, data: PaymentPayloadInterface): Observable<PaymentPayloadInterface> {
    return this.paymentsApiService.saveConnectPaymentPayload(this.getBusinessUuid(), paymentMethod, data).pipe(
      flatMap(() => {
        return this.getConnectPaymentPayload(paymentMethod, true).pipe(filter(d => !!d), take(1));
      })
    );
  }

  enableExternalPaymentMethod(payment: PaymentWithVariantInterface): Observable<void> {
    return this.paymentsApiService.enableExternalPaymentMethod(payment).pipe(
      flatMap(() => this.reloadPaymentsWithVariant())
    );
  }

  isExternalAuthSuccess(params: Params): boolean {
    return this.paymentsApiService.isExternalAuthSuccess(params);
  }

  redirectToExternalAuth(variant: VariantListItemInterface): Observable<boolean> {
    return this.paymentsApiService.redirectToExternalAuth(variant);
  }

  redirectToExternalRegistration(variant: VariantListItemInterface, step: StepInterface): Observable<boolean> {
    return this.paymentsApiService.redirectToExternalRegistration(variant, step);
  }

  getConditions(variant: VariantListItemInterface, reset: boolean = false): Observable<BusinessOptionConditionsInterface> {
    if (!this.conditions[variant.id]) {
      this.conditions[variant.id] = {
        subject: new BehaviorSubject<BusinessOptionConditionsInterface>(null),
        processed: false
      };
    }
    if (!this.conditions[variant.id].processed || reset) {
      this.conditions[variant.id].processed = true;
      this.conditions[variant.id].subject.next(null);

      this.paymentsApiService.getConditions(variant).subscribe((data: BusinessOptionConditionsInterface) => {
        this.conditions[variant.id].subject.next(data);
      });
    }
    return this.conditions[variant.id].subject.asObservable();
  }

  saveUserBusinesses(paymentMethod: PaymentMethodEnum, data: UserBusinessInterface, sendApplicationOnSave: boolean): Observable<void> {
    return this.integrationsStateService.saveUserBusinesses(data).pipe(
      delay(300), // Rabbit is too slow sometimes
      flatMap(() => this.reloadPaymentsWithVariant()),
      flatMap(() => {
        if (sendApplicationOnSave) {
          return this.saveConnectPaymentPayload(paymentMethod, { application_sent: true }).pipe(
            map(() => null)
          );
        } else {
          return of(null);
        }
      })
    );
  }

  refreshUserBusinesses(paymentMethod: PaymentMethodEnum): Observable<void> {
    // return this.integrationsStateService.saveUserBusinesses(data).pipe(
    return this.integrationsStateService.getUserBusinessesOnce(true).pipe(
      delay(300), // Rabbit is too slow sometimes
      flatMap(() => this.reloadPaymentsWithVariant())
    );
  }

  isSectionExternalRegisterFilled(option: PaymentOptionExInterface): boolean {
    return !!localStorage.getItem(this.externalRegPrefix + option.payment_method) && false;
  }

  setSectionExternalRegisterFilled(option: PaymentOptionExInterface, filled: boolean = true): void {
    if (filled) {
      localStorage.setItem(this.externalRegPrefix + option.payment_method, 'true');
    } else {
      localStorage.removeItem(this.externalRegPrefix + option.payment_method);
    }
  }

  openInstalledIntegration(integration: IntegrationInfoWithStatusInterface, queryParams: object = {}): void { // TODO Should not be here but can't find better place
    const businessId = this.integrationsStateService.getBusinessId();
    this.router.navigate([`business/${businessId}/connect/${integration.category}/configure/${integration.name}`], {queryParams});
  }

  installIntegrationAndGoToDone(install: boolean , integration: IntegrationInfoWithStatusInterface): Observable<IntegrationShortStatusInterface> { // TODO Should not be here but can't find better place
    // We have this.integration.extension only for 'billing-subscriptions' that is not part of PHP backend
    let result: Observable<void> = of(null);

    if (integration.category === IntegrationCategory.Payments && !integration.extension) {
      // Hacks for payments TODO Maybe better to move to installIntegration()
      result = this.resetCredentailsByPaymentMethod(integration.name as any);
      // This resetting should be done at BE but we have to do here:
      result = result.pipe(flatMap(() => {
        return this.resetDocumentsByPaymentMethod(integration.name as any);
      }));
    }

    return result.pipe(() => {
      return this.integrationsStateService.installIntegration(integration.name, this, install);
    });
  }

  handleError(error: any, showSnack?: boolean): void { // TODO Should not be here but can't find better place
    if (!error.message) {
      error.message = this.translateService.translate('errors.unknown_error');
    }
    if (error.status === 403 || error.statusCode === 403 || error.code === 403) {
      error.message = this.translateService.translate('errors.forbidden');
    }
    if (showSnack) {
      this.snackBarService.toggle(true, error.message || this.translateService.translate('errors.unknown_error'), {
        duration: 5000,
        iconId: 'icon-alert-24',
        iconSize: 24
      });
    }
  }

  private getPaymentOptions(reset: boolean = false): Observable<PaymentOptionExInterface[]> {
    if (!this.paymentOptionsProcessed || reset) {
      this.paymentOptionsProcessed = true;
      this.paymentOptionsSubject.next(null);

      this.paymentsApiService.getPaymentOptions()
        .subscribe((data: PaymentOptionExInterface[]) => this.paymentOptionsSubject.next(data));
    }
    return this.paymentOptionsSubject.asObservable();
  }

  private getVariantList(businessSlug: string, reset: boolean = false): Observable<MappedVariantListItemInterface> {
    if (!this.variantList[businessSlug]) {
      this.variantList[businessSlug] = {
        subject: new BehaviorSubject<MappedVariantListItemInterface>(null),
        processed: false
      };
    }
    if (!this.variantList[businessSlug].processed || reset) {
      this.variantList[businessSlug].processed = true;
      this.variantList[businessSlug].subject.next(null);

      this.paymentsApiService.getVariantList(businessSlug).subscribe((data: MappedVariantListItemInterface) => {
        this.variantList[businessSlug].subject.next(data);
      });
    }
    return this.variantList[businessSlug].subject.asObservable();
  }
}
