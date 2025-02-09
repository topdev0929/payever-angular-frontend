import { Injectable } from '@angular/core';
import { Router } from '@angular/router';

import { AuthService } from '@pe/ng-kit/modules/auth';
import { EnvironmentConfigService } from '@pe/ng-kit/modules/environment-config';

import { FiltersFieldType } from '../interfaces';
import * as settings from '../settings';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

interface RestUrlInterface {
  [propName: string]: (param1?: string, param2?: string, param3?: string) => string;
}

@Injectable()
export class SettingsService {

  get apiMicroBaseUrl(): string {
    return this.configService.getConfig().backend.transactions || '';
  }

  get apiMicroCheckoutUrl(): string {
    return this.configService.getConfig().backend.payments;
  }

  get apiThirdPartyPaymentsUrl(): string {
    return this.configService.getConfig().thirdParty.payments;
  }

  get apiMicroConnectUrl(): string {
    return this.configService.getConfig().backend.connect;
  }

  get apiMicroUsersUrl(): string {
    return this.configService.getConfig().backend.users;
  }

  get apiMicroShippingUrl(): string {
    return this.configService.getConfig().backend.shipping;
  }

  get apiMicroMailerUrl(): string {
    return this.configService.getConfig().backend.mailer;
  }

  get checkoutWrapperUrl(): string {
    return (this.configService.getConfig().frontend as any).checkoutWrapper;
  }

  get apiBusinessUrls(): RestUrlInterface {
    const isAdmin: boolean = this.authService.isAdmin();
    return {
      apiGetListUrl: (businessUuid: string): string => isAdmin ?
        `${this.apiMicroBaseUrl}/api/admin/list` :
        `${this.apiMicroBaseUrl}/api/business/${businessUuid}/list`,
      apiGetColumnsUrl: (businessUuid: string): string => isAdmin ?
        `${this.apiMicroBaseUrl}/api/admin/settings` :
        `${this.apiMicroBaseUrl}/api/business/${businessUuid}/settings`,
      apiGetOrderDetailsUrl: (businessUuid: string, orderUuid: string): string => isAdmin ?
        `${this.apiMicroBaseUrl}/api/admin/detail/${orderUuid}` :
        `${this.apiMicroBaseUrl}/api/business/${businessUuid}/detail/${orderUuid}`,
      postActionUrl: (businessUuid: string, transactionUuid: string, action: string) => `${this.apiMicroBaseUrl}/api/business/${businessUuid}/${transactionUuid}/action/${action}`,
      apiGetOrderPaymentUrl: (transactionUuid: string): string => `${this.apiMicroCheckoutUrl}/api/rest/v1/checkout/payment/${transactionUuid}`,
      apiGetExport: (businessUuid: string): string =>
        isAdmin ?
        `${this.apiMicroBaseUrl}/api/admin/export` :
        `${this.apiMicroBaseUrl}/api/business/${businessUuid}/export`,
      postShippingOrder: (businessUuid: string, shippingOrderId: string): string => `${this.apiMicroShippingUrl}/api/business/${businessUuid}/shipping-orders/${shippingOrderId}`,
    };
  }

  get apiPersonalUrls(): RestUrlInterface {
    return {
      apiGetListUrl: (): string => `${this.apiMicroBaseUrl}/api/user/list`,
      apiGetColumnsUrl: (): string => `${this.apiMicroBaseUrl}/api/user/settings`,
      apiGetOrderDetailsUrl: (orderUuid: string): string => `${this.apiMicroBaseUrl}/api/user/detail/${orderUuid}`,
      apiGetOrderPaymentUrl: (transactionUuid: string): string => `${this.apiMicroCheckoutUrl}/api/rest/v1/checkout/payment/${transactionUuid}`,
      apiGetExport: (businessUuid: string): string => `${this.apiMicroCheckoutUrl}/api/rest/v1/business/${businessUuid}/export`
    };
  }

  get externalUrls(): RestUrlInterface {
    const token: string = encodeURIComponent(this.authService.token);
    return {
      getSantanderCheckStatusUrl: (businessUuid: string, transactionUuid: string) => `${this.apiMicroBaseUrl}/api/business/${businessUuid}/${transactionUuid}/update-status`,
      getTransactionDataUrl: (businessUuid: string, transactionUuid: string) => `${this.apiMicroBaseUrl}/api/business/${businessUuid}/${transactionUuid}`,
      getSantanderContractUrl: (id: string) => `${this.apiMicroCheckoutUrl}/santander-de/download-contract/${id}?access_token=${token}`,
      getSantanderFactoringContractUrl: (businessUuid: string, id: string) => `${this.apiThirdPartyPaymentsUrl}/api/download-resource/business/${businessUuid}/integration/santander_pos_factoring_de/action/contract?paymentId=${id}&access_token=${token}`,
      getSantanderInvoiceContractUrl:   (businessUuid: string, id: string) => `${this.apiThirdPartyPaymentsUrl}/api/download-resource/business/${businessUuid}/integration/santander_pos_invoice_de/action/contract?paymentId=${id}&access_token=${token}`,
      getSantanderDeQr: (firstName: string, lastName: string, referenceNumber: string) => {
        return `${this.apiMicroCheckoutUrl}/santander-de/qr?first_name=${firstName}&last_name=${lastName}&number=${referenceNumber}`;
      },
      getBusinessVatUrl: (slug: string) => `/business/${slug}/vat`, // TODO Not used?
      getSantanderPosInstallmentEditUrl: (flowId: string) => `${this.checkoutWrapperUrl}/pay/${flowId}?editMode=true&modalWindowMode=true&forceNoCloseButton=true`,
      getShippingActionsUrl: () => `${this.apiMicroShippingUrl}/api/transaction-actions`,
      getMailerActionsUrl: () => `${this.apiMicroMailerUrl}/api/transaction-actions`
    };
  }

  get isEmbeddedMode(): boolean {
    return this.isEmbeddedModeValue;
  }

  set isEmbeddedMode(isEmbedded: boolean) {
    this.isEmbeddedModeValue = isEmbedded;
  }

  get isPersonal(): boolean {
    return this.isPersonalMode;
  }

  set isPersonal(isPersonal: boolean) {
    this.isPersonalMode = isPersonal;
  }

  get parentApp(): string {
    return this.parentAppValue;
  }

  set parentApp(app: string) {
    this.parentAppValue = app;
  }

  get parentAppId(): string {
    return this.parentAppIdValue;
  }

  set parentAppId(appId: string) {
    this.parentAppIdValue = appId;
  }

  get parentBackUrl(): string {
    return this.parentBackUrlValue;
  }

  set parentBackUrl(backUrl: string) {
    this.parentBackUrlValue = backUrl;
  }

  get embedded(): boolean {
    return this.isEmbedded;
  }

  set embedded(isEmbedded: boolean) {
    this.isEmbedded = isEmbedded;
  }

  get settings(): any {
    return settings;
  }

  get filters(): any {
    if (this.embedded) {
      return settings.filtersList.filter((filterItem: any) => filterItem.field !== FiltersFieldType.Channel);
    } else {
      return settings.filtersList;
    }
  }

  get businessUuid(): string {
    // TODO This is durty hack but current logic not working
    const data = window.location.pathname.split('/'); // TODO get via activatedRoute
    // const data = this.router.url.split('/');
    return this.businessUuidValue || data[2];
  }

  set businessUuid(businessUuid: string) {
    this.businessUuidValue = businessUuid;
  }

  get isPrivate(): boolean {
    return this.isPrivateValue;
  }

  set isPrivate(isPrivate: boolean) {
    this.isPrivateValue = isPrivate;
  }

  get apiGetListUrl(): string {
    return this.isPrivate
      ? this.apiBusinessUrls['apiGetPrivateListUrl']()
      :  this.isPersonal
        ? this.apiPersonalUrls['apiGetListUrl']()
        : this.apiBusinessUrls['apiGetListUrl'](this.businessUuid);
  }

  get apiGetExport(): string {
    return this.isPrivate
      ? this.apiBusinessUrls['apiGetExport']()
      :  this.isPersonal
        ? this.apiPersonalUrls['apiGetExport']()
        : this.apiBusinessUrls['apiGetExport'](this.businessUuid);
  }

  get apiGetColumnsUrl(): string {
    return this.isPrivate
      ? this.apiBusinessUrls['apiGetPrivateColumnsUrl']()
      : this.isPersonal
        ? this.apiPersonalUrls['apiGetColumnsUrl']()
        : this.apiBusinessUrls['apiGetColumnsUrl'](this.businessUuid);
  }

  get apiPutColumnsUrl(): string {
    return this.isPrivate
      ? this.apiBusinessUrls['apiPutPrivateColumnsUrl']()
      : this.apiBusinessUrls['apiPutColumnsUrl'](this.businessUuid);
  }

  apiAppBaseUrl$: Observable<string> = this.configService.getConfig$().pipe(
    map(config => {
      return `${config.backend.commerceos}/api/apps/business/${this.businessUuid}`;
    })
  );

  private isEmbedded: boolean = false;
  private isPersonalMode: boolean = false;
  private businessUuidValue: string;
  private isPrivateValue: boolean = false;
  private parentAppValue: string;
  private parentAppIdValue: string;
  private parentBackUrlValue: string;
  private isEmbeddedModeValue: boolean;

  constructor(
    private authService: AuthService,
    private configService: EnvironmentConfigService,
    private router: Router
  ) {
  }

  getApiGetOrderDetailsUrl(orderUuid : string): string {
    return this.isPersonal
      ? this.apiPersonalUrls['apiGetOrderDetailsUrl'](orderUuid)
      : this.apiBusinessUrls['apiGetOrderDetailsUrl'](this.businessUuid, orderUuid);
  }

  getBusinessDataUrl(): string {
    return `${this.apiMicroUsersUrl}/api/business/${this.businessUuid}`;
  }

  getFiltersCacheKey(businessUuid: string): string {
    return `business.${businessUuid}.transactions.filters`;
  }

}
