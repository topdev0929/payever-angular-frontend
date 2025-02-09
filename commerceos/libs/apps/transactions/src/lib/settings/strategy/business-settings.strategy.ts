import { AbstractSettingsClass } from './abstract.settings';

export class BusinessSettingsStrategyClass extends AbstractSettingsClass {

  public apiGetListUrl(): string {
    return `${this.apiMicroBaseUrl}/api/business/${this.businessUuid}/list`;
  }

  public apiGetColumnsUrl(): string {
    return `${this.apiMicroBaseUrl}/api/business/${this.businessUuid}/settings`;
  }

  public apiGetOrderDetailsUrl(orderUuid: string): string {
    return `${this.apiMicroBaseUrl}/api/business/${this.businessUuid}/transaction/${orderUuid}/details`;
  }

  public apiGetOrderActionsUrl(orderUuid: string): string {
    return `${this.apiMicroBaseUrl}/api/business/${this.businessUuid}/transaction/${orderUuid}/actions`;
  }

  public apiGetExport(): string {
    return `${this.apiMicroBaseUrl}/api/business/${this.businessUuid}/export`;
  }

  public apiRootDocuments(): string {
    return `${this.apiMicroBaseUrl}/api/folders/business/${this.businessUuid}/root-documents`;
  }

  public apiFolderDocuments(folderId: string) {
    return `${this.apiMicroBaseUrl}/api/folders/business/${this.businessUuid}/folder/${folderId}/documents`;
  }

  public apiFlatFolders(): string {
    return `${this.apiMicroBaseUrl}/api/folders/business/${this.businessUuid}`;
  }

  public apiFoldersTree(): string {
    return `${this.apiMicroBaseUrl}/api/folders/business/${this.businessUuid}/tree`;
  }

  public apiPostFolder(): string {
    return `${this.apiMicroBaseUrl}/api/folders/business/${this.businessUuid}`;
  }

  public apiPatchFolder(folderId: string) {
    return `${this.apiMicroBaseUrl}/api/folders/business/${this.businessUuid}/folder/${folderId}`;
  }

  public apiPatchFolderPosition(): string {
    return `${this.apiMicroBaseUrl}/api/folders/business/${this.businessUuid}/update-positions`;
  }

  public apiDeleteFolder(folderId: string): string {
    return `${this.apiMicroBaseUrl}/api/folders/business/${this.businessUuid}/folder/${folderId}`;
  }

  public apiMoveToFolder(folderId: string, documentId: string): string {
    return `${this.apiMicroBaseUrl}/api/folders/business/${this.businessUuid}/document/${documentId}/move-to-folder/${folderId}`;
  }

  public apiMoveToRoot(documentId: string): string {
    return `${this.apiMicroBaseUrl}/api/folders/business/${this.businessUuid}/document/${documentId}/move-to-root`;
  }
}
