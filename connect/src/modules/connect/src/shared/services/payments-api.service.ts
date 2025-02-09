import { HttpClient } from '@angular/common/http';
import { Inject, Injectable, Injector } from '@angular/core';
import { Params } from '@angular/router';
import { forEach, isString } from 'lodash-es';
import { flatten, unflatten } from 'flat';
import { combineLatest, Observable, of, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';

import { PeAuthService } from '@pe/auth';
import { EnvironmentConfigInterface as EnvInterface, NodeJsBackendConfigInterface, PE_ENV } from '@pe/common';

import { ResponseErrorsInterface } from '../http-interceptors';
import {
  BusinessInterface, BusinessOptionConditionsInterface, VariantListItemInterface,
  PaymentWithVariantInterface, MappedVariantListItemInterface,
  PaymentOptionExInterface, SantanderDkStoreProductDataInterface, StepInterface,
  PaymentPayloadInterface, PaymentMethodEnum
} from '../interfaces';

@Injectable()
export class PaymentsApiService {
  constructor(
    private http: HttpClient,
    protected injector: Injector,
    @Inject(PE_ENV) private envConfig: EnvInterface
  ) { }

  // TODO Not sure that right place
  getUserBusiness(businessId: string): Observable<BusinessInterface> {
    const config: NodeJsBackendConfigInterface = this.envConfig.backend;

    return this.http.get<BusinessInterface>(`${config.users}/api/business/${businessId}`);
  }

  getPaymentOptions(): Observable<PaymentOptionExInterface[]> {
    const config: NodeJsBackendConfigInterface = this.envConfig.backend;

    return this.http.get<PaymentOptionExInterface[]>(`${config.payments}/api/rest/v1/payment-options`);
  }

  getVariantList(business: string): Observable<MappedVariantListItemInterface> {
    const config: NodeJsBackendConfigInterface = this.envConfig.backend;

    return this.http.get<MappedVariantListItemInterface>(`${config.payments}/api/rest/v3/business-payment-option/${business}/variants`);
  }

  getSantanderDkCredentialsStoreProductData(
    variant: VariantListItemInterface,
    storeId: string
  ): Observable<SantanderDkStoreProductDataInterface[]> {
    const config: NodeJsBackendConfigInterface = this.envConfig.backend;

    return this.http.get<SantanderDkStoreProductDataInterface[]>(
      `${config.payments}/santander-dk/credentials/${variant.id}/store/${storeId}/product-data`
    );
  }

  createAccount<T>(data: T, variant: VariantListItemInterface): Observable<VariantListItemInterface> {
    const config: NodeJsBackendConfigInterface = this.envConfig.backend;

    return this.http.post<VariantListItemInterface>(
      `${config.payments}/api/rest/v1/business-payment-option/${variant.id}/credentials/additional`,
      data
    ).pipe(catchError((error: ResponseErrorsInterface) => {
      console.warn(error);
      console.warn(flatten(error.errors));
      const flat: { [key: string]: string } = {};
      forEach(flatten(error.errors) as { [key: string]: string }, (value: string, key: string) => {
        key = key.replace('.errors.0', ''); // We always have single error
        for (let i = 0; i < 10; i++) {
          key = key.replace('children.', '');
        }
        if (isString(value)) {
          flat[key] = value;
        }
      });
      console.warn(flat);
      error.errors = unflatten(flat);
      return throwError(error);
    }));
  }

  // TODO BE Should return updated value. Now returns nothing
  saveCredentials<T>(data: T, payment: PaymentWithVariantInterface, variant: VariantListItemInterface): Observable<void> {
    const config: NodeJsBackendConfigInterface = this.envConfig.backend;
    return this.http.patch<void>(`${config.thirdParty}/api/business/${payment.businessUuid}/payments/${payment.option.payment_method}/${variant.id}/credentials/set`,
      data
    ).pipe(catchError((error: ResponseErrorsInterface) => {
      // TODO Transform error.errors
      console.error(error);
      return throwError(error);
    }));
  }

  // TODO BE Should retuen updated value. Now returns nothing
  saveOptions<T>(data: T, variant: VariantListItemInterface): Observable<void> {
    const config: NodeJsBackendConfigInterface = this.envConfig.backend;

    return this.http.post<void>(
      `${config.payments}/api/rest/v1/business-payment-option/${variant.id}`,
      data
    ).pipe(catchError((error: ResponseErrorsInterface) => {
      // TODO Transform error.errors
      console.error(error);
      return throwError(error);
    }));
  }

  enableOption(variant: VariantListItemInterface): Observable<void> {
    const config: NodeJsBackendConfigInterface = this.envConfig.backend;

    return this.http.patch<void>(
      `${config.payments}/api/rest/v1/business-payment-option/${variant.id}`,
      { enabled: 'true' }
    ).pipe(catchError((error: ResponseErrorsInterface) => {
      // TODO Transform error.errors
      console.error(error);
      return throwError(error);
    }));
  }

  addConnectionVariant(business: string, paymentMethod: PaymentMethodEnum, name: string): Observable<void> {
    const config: NodeJsBackendConfigInterface = this.envConfig.backend;

    return this.http.post<void>(
      `${config.payments}/api/rest/v3/business-payment-option/${business}`,
      {
        name: name,
        payment_method: paymentMethod
      }
    ).pipe(catchError((error: ResponseErrorsInterface) => {
      // TODO Transform error.errors
      console.error(error);
      return throwError(error);
    }));
  }

  enableOptions(variants: VariantListItemInterface[]): Observable<void> {
    return combineLatest(variants.map(variant => this.enableOption(variant))).pipe(map(() => null));
  }

  resetCredentails(payment: PaymentWithVariantInterface, variant: VariantListItemInterface): Observable<void> {
    const config: NodeJsBackendConfigInterface = this.envConfig.backend;

    return this.http.patch<void>(`${config.thirdParty}/api/business/${payment.businessUuid}/payments/${payment.option.payment_method}/${variant.id}/credentials/reset`,
      {}
    );
  }

  deleteConnectionVariant(payment: PaymentWithVariantInterface, variant: VariantListItemInterface): Observable<void> {
    const config: NodeJsBackendConfigInterface = this.envConfig.backend;
    return this.http.delete<void>(`${config.payments}/api/rest/v3/business-payment-option/${variant.id}`, {});
  }

  enableExternalPaymentMethod(payment: PaymentWithVariantInterface): Observable<void> {
    const config: NodeJsBackendConfigInterface = this.envConfig.backend;
    return this.http.patch<void>(`${config.thirdParty}/api/business/${payment.businessUuid}/payments/${payment.option.payment_method}/enable`, {});
  }

  isExternalAuthSuccess(params: Params): boolean {
    return params['enable'] === 'true';
  }

  redirectToExternalAuth(variant: VariantListItemInterface): Observable<boolean> {
    const config: NodeJsBackendConfigInterface = this.envConfig.backend;

    const authService: PeAuthService = this.injector.get(PeAuthService);
    window.top.location.href =
      `${config.payments}/external-credentials/${variant.id}` +
      `/request-code?redirect_url=${encodeURIComponent(`${location.href}?enable=true`)}&access_token=${authService.token}`;

    return of(true);
  }

  redirectToExternalRegistration(variant: VariantListItemInterface, step: StepInterface): Observable<boolean> {
    const config: NodeJsBackendConfigInterface = this.envConfig.backend;

    window.top.location.href = `${config.payments}${step.url}`;
    return of(true);
  }

  saveBusinessDocument(business: string, name: string, blobName: string): Observable<void> {
    const config: NodeJsBackendConfigInterface = this.envConfig.backend;
    const data = {};
    data[name] = blobName;
    return this.http.patch<void>(`${config.users}/api/business/${business}`, {
      documents: data
    });
  }

  getConnectPaymentPayload(business: string, paymentMethod: PaymentMethodEnum): Observable<PaymentPayloadInterface> {
    const config: NodeJsBackendConfigInterface = this.envConfig.backend;

    return this.http.get<PaymentPayloadInterface>(
      `${config.connect}/api/business/${business}/payments/${paymentMethod}/payload`,
    ).pipe(catchError((error: ResponseErrorsInterface) => {
      console.error(error);
      return throwError(error);
    }));
  }

  saveConnectPaymentPayload(business: string, paymentMethod: PaymentMethodEnum, data: PaymentPayloadInterface): Observable<void> { // TP
    const config: NodeJsBackendConfigInterface = this.envConfig.backend;

    return this.http.patch<void>(
      `${config.connect}/api/business/${business}/payments/${paymentMethod}/payload`,
      data
    ).pipe(catchError((error: ResponseErrorsInterface) => {
      console.error(error);
      return throwError(error);
    }));
  }

  saveOptionDocument(variant: VariantListItemInterface, name: string, blobName: string): Observable<void> {
    const config: NodeJsBackendConfigInterface = this.envConfig.backend;
    const data = {};
    data[name] = blobName;
    return this.http.patch<void>(
      `${config.payments}/api/rest/v3/business-payment-option/${variant.id}/update-contract`,
      data
    ).pipe(catchError((error: ResponseErrorsInterface) => {
      // TODO Transform error.errors
      console.error(error);
      return throwError(error);
    }));
  }

  getConditions(variant: VariantListItemInterface): Observable<BusinessOptionConditionsInterface> {
    const config: NodeJsBackendConfigInterface = this.envConfig.backend;

    return this.http.get<BusinessOptionConditionsInterface>(
      `${config.payments}/api/rest/v3/business-payment-option/${variant.id}/values`
    );
  }
}
