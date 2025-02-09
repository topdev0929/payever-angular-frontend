import { BusinessSettingsStrategyClass } from './business-settings.strategy';

export class AdminSettingsStrategyClass extends BusinessSettingsStrategyClass {

  override apiGetListUrl(): string {
    return `${this.apiMicroBaseUrl}/api/admin/list`;
  }

  override apiGetColumnsUrl(): string {
    return `${this.apiMicroBaseUrl}/api/admin/settings`;
  }

  override apiGetOrderDetailsUrl(orderUuid: string): string {
    return `${this.apiMicroBaseUrl}/api/admin/detail/${orderUuid}`;
  }

  override apiGetOrderActionsUrl(orderUuid: string): string {
    return `${this.apiMicroBaseUrl}/api/admin/detail/${orderUuid}`;
  }

  public apiGetExport(): string {
    return `${this.apiMicroBaseUrl}/api/admin/export`;
  }

  override apiRootDocuments(): string {
    return `${this.apiMicroBaseUrl}/api/admin/folders/root-documents`;
  }

  override apiFolderDocuments(folderId: string) {
    return `${this.apiMicroBaseUrl}/api/admin/folders/folder/${folderId}/documents`;
  }

  override apiFlatFolders(): string {
    return `${this.apiMicroBaseUrl}/api/admin/folders`;
  }
}
