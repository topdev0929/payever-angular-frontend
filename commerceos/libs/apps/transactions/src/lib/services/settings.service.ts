import { Inject, Injectable } from '@angular/core';
import { SelectSnapshot } from '@ngxs-labs/select-snapshot';

import { RestUrlInterface } from '@pe/api';
import { PeAuthService } from '@pe/auth';
import { CosEnvService } from '@pe/base';
import { PaymentMethodEnum } from '@pe/checkout-types';
import { EnvironmentConfigInterface, EnvService, PE_ENV } from '@pe/common';
import { PeUser, UserState } from '@pe/user';

import {
  AbstractSettingsClass,
  AdminSettingsStrategyClass,
  BusinessSettingsStrategyClass,
  ConstructorParameters,
  PersonalSettingsStrategyClass
} from "../settings/strategy";

@Injectable({
  providedIn: 'any',
})
export class SettingsService {
  @SelectSnapshot(UserState.user) userData: PeUser;

  settingsStrategy: AbstractSettingsClass;

  constructor(
    @Inject(PE_ENV) private envConfig: EnvironmentConfigInterface,
    private cosEnvService: CosEnvService,
    private envService: EnvService,
    private authService: PeAuthService
  ) {
    this.initStrategy();
  }

  get businessUuid(): string {
    return this.envService.businessId;
  }

  get userId(): string {
    return this.userData._id;
  }

  get isAdmin(): boolean {
    return this.authService.isAdmin();
  }

  get isPersonal(): boolean {
    return this.cosEnvService.isPersonalMode;
  }

  get apiMicroBaseUrl(): string {
    return this.envConfig.backend.transactions;
  }

  get apiMicroShippingUrl(): string {
    return this.envConfig.backend.shipping;
  }

  get apiThirdPartyPaymentsUrl(): string {
    return this.envConfig.thirdParty.payments;
  }

  get checkoutWrapperUrl(): string {
    return this.envConfig.frontend.checkoutWrapper;
  }

  get apiMicroMailerUrl(): string {
    return this.envConfig.backend.mailer;
  }

  get baseUrl() {
    if (this.isPersonal) {
      return ['personal', this.userId, 'transactions', 'list'];
    }

    return ['business', this.envService.businessId, 'transactions', 'list'];
  }


  get externalUrls(): RestUrlInterface {
    const token: string = encodeURIComponent(this.authService.token);

    return {
      getSantanderCheckStatusUrl: (businessUuid: string, transactionUuid: string) =>
        `${this.apiMicroBaseUrl}/api/business/${businessUuid}/${transactionUuid}/update-status`,
      getTransactionDataUrl: (businessUuid: string, transactionUuid: string) =>
        `${this.apiMicroBaseUrl}/api/business/${businessUuid}/${transactionUuid}`,
      // TODO: Replace endpoint to node api - checkout-backend
      // getSantanderContractUrl: (id: string) => `${this.apiMicroCheckoutUrl}/santander-de/download-contract/${id}?access_token=${token}`,
      getSantanderPosDeContractUrl: (businessUuid: string, id: string) =>
        `${this.apiMicroBaseUrl}/api/business/${businessUuid}/download-contract/${id}`,
      getSantanderFactoringContractUrl: (businessUuid: string, id: string) =>
        `${this.apiThirdPartyPaymentsUrl}/api/download-resource/business/${businessUuid}`
        + `/integration/santander_pos_factoring_de/action/contract?paymentId=${id}&access_token=${token}`,
      getSantanderInvoiceContractUrl: (businessUuid: string, id: string) =>
        `${this.apiThirdPartyPaymentsUrl}/api/download-resource/business/${businessUuid}`
        + `/integration/santander_pos_invoice_de/action/contract?paymentId=${id}&access_token=${token}`,
      // TODO: Replace endpoint to node api - checkout-backend
      // getSantanderDeQr: (firstName: string, lastName: string, referenceNumber: string) => {
      //   return `${this.apiMicroCheckoutUrl}/santander-de/qr?first_name=${firstName}&last_name=${lastName}&number=${referenceNumber}`;
      // },
      getBusinessVatUrl: (slug: string) => `/business/${slug}/vat`,
      getSantanderPosInstallmentEditUrl: (flowId: string) =>
        `${this.checkoutWrapperUrl}/pay/${flowId}?editMode=true&modalWindowMode=true&forceNoCloseButton=true`,
    };
  }

  get contractUrl(): RestUrlInterface {
    return {
      [PaymentMethodEnum.SANTANDER_INSTALLMENT]: (_, id: string) =>
        this.externalUrls.getSantanderContractUrl(id),
      [PaymentMethodEnum.SANTANDER_POS_INSTALLMENT]: (businessUuid: string, id: string) =>
        this.externalUrls.getSantanderPosDeContractUrl(businessUuid, id),
      [PaymentMethodEnum.SANTANDER_POS_FACTORING_DE]: (businessUuid: string, id: string) =>
        this.externalUrls.getSantanderFactoringContractUrl(businessUuid, id),
      [PaymentMethodEnum.SANTANDER_POS_INVOICE_DE]: (businessUuid: string, id: string) =>
        this.externalUrls.getSantanderInvoiceContractUrl(businessUuid, id),
    };
  }

  get apiRootDocuments(): string {
    return this.settingsStrategy.apiRootDocuments();
  }

  get apiFlatFolders(): string {
    return this.settingsStrategy.apiFlatFolders();
  }

  get apiFoldersTree(): string {
    return this.settingsStrategy.apiFoldersTree();
  }

  get apiPostFolder(): string {
    return this.settingsStrategy.apiPostFolder();
  }

  get apiPatchFolderPosition(): string {
    return this.settingsStrategy.apiPatchFolderPosition();
  }

  get apiGetListUrl(): string {
    return this.settingsStrategy.apiGetListUrl();
  }

  get apiGetColumnsUrl(): string {
    return this.settingsStrategy.apiGetColumnsUrl();
  }

  get apiGetExport(): string {
    return this.settingsStrategy.apiGetExport();
  }

  getApiGetOrderDetailsUrl(orderUuid: string): string {
    return this.settingsStrategy.apiGetOrderDetailsUrl(orderUuid);
  }

  getApiGetOrderActionsUrl(orderUuid: string): string {
    return this.settingsStrategy.apiGetOrderActionsUrl(orderUuid);
  }

  apiFolderDocuments(folderId: string): string {
    return this.settingsStrategy.apiFolderDocuments(folderId);
  }

  apiPatchFolder(folderId: string): string {
    return this.settingsStrategy.apiPatchFolder(folderId);
  }

  apiDeleteFolder(folderId: string): string {
    return this.settingsStrategy.apiDeleteFolder(folderId);
  }

  apiMoveToFolder(folderId: string, documentId: string): string {
    return this.settingsStrategy.apiMoveToFolder(folderId, documentId);
  }

  apiMoveToRoot(documentId: string): string {
    return this.settingsStrategy.apiMoveToRoot(documentId);
  }

  postActionUrl(transactionUuid: string, action: string): string {
    return this.settingsStrategy.postActionUrl(transactionUuid, action);
  }

  postShippingOrder(shippingOrderId: string): string {
    return this.settingsStrategy.postShippingOrder(shippingOrderId);
  }

  private initStrategy() {
    const args: ConstructorParameters = [
      this.envConfig,
      this.envService,
    ];

    if (this.isPersonal) {
      this.settingsStrategy = new PersonalSettingsStrategyClass(...args);
    } else if (this.isAdmin) {
      this.settingsStrategy = new AdminSettingsStrategyClass(...args);
    } else {
      this.settingsStrategy = new BusinessSettingsStrategyClass(...args);
    }
  }
}
