import { EnvService, EnvironmentConfigInterface } from '@pe/common';

export type ConstructorParameters = [
  envConfig: EnvironmentConfigInterface,
  envService: EnvService,
]

export abstract class AbstractSettingsClass {
  constructor(
    protected envConfig: EnvironmentConfigInterface,
    protected envService: EnvService,
  ) { }

  public abstract apiGetListUrl(): string;

  public abstract apiGetColumnsUrl(): string;

  public abstract apiGetOrderDetailsUrl(orderUuid: string): string;

  public abstract apiGetOrderActionsUrl(orderUuid: string): string;

  public abstract apiGetExport(): string;

  public abstract apiRootDocuments(): string;

  public abstract apiFolderDocuments(folderId: string): string;

  public abstract apiFlatFolders(): string;

  public abstract apiFoldersTree(): string;

  public  abstract apiPostFolder(): string;

  public abstract apiPatchFolder(folderId: string): string;

  public abstract apiPatchFolderPosition(): string;

  public abstract apiDeleteFolder(folderId: string): string;

  public abstract apiMoveToFolder(folderId: string, documentId: string): string;

  public abstract apiMoveToRoot(documentId: string): string;

  get apiMicroShippingUrl(): string {
    return this.envConfig.backend.shipping;
  }

  get apiMicroBaseUrl(): string {
    return this.envConfig.backend.transactions;
  }

  get businessUuid(): string {
    return this.envService.businessId;
  }

  public postActionUrl(transactionUuid: string, action: string): string {
    return `${this.apiMicroBaseUrl}/api/business/${this.businessUuid}/${transactionUuid}/action/${action}`;
  }

  public postShippingOrder(shippingOrderId: string): string {
    return `${this.apiMicroShippingUrl}/api/business/${this.businessUuid}/shipping-orders/${shippingOrderId}`;
  }
}
