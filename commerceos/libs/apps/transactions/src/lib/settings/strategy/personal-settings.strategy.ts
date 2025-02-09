import { SelectSnapshot } from '@ngxs-labs/select-snapshot';

import { PeUser, UserState } from '@pe/user';

import { AbstractSettingsClass } from './abstract.settings';

export class PersonalSettingsStrategyClass extends AbstractSettingsClass {
  @SelectSnapshot(UserState.user) userData: PeUser;

  get userId(): string {
    return this.userData._id;
  }

  public apiGetListUrl(): string {
    return `${this.apiMicroBaseUrl}/api/user/list`;
  }

  public apiGetColumnsUrl(): string {
    return `${this.apiMicroBaseUrl}/api/user/settings`;
  }

  public apiGetOrderDetailsUrl(orderUuid: string): string {
    return `${this.apiMicroBaseUrl}/api/user/detail/${orderUuid}`;
  }

  public apiGetOrderActionsUrl(orderUuid: string): string {
    return `${this.apiMicroBaseUrl}/api/user/${this.userId}/transaction/${orderUuid}/actions`;
  }

  public apiGetExport(): string {
    return `${this.apiMicroBaseUrl}/api/user/${this.userId}/export`;
  }

  public apiRootDocuments(): string {
    return `${this.apiMicroBaseUrl}/api/folders/user/${this.userId}/root-documents`;
  }

  public apiFolderDocuments(folderId: string): string {
    return `${this.apiMicroBaseUrl}/api/folders/user/${this.userId}/folder/${folderId}/documents`;
  }

  public apiFlatFolders(): string {
    return `${this.apiMicroBaseUrl}/api/folders/user/${this.userId}`;
  }

  public apiFoldersTree(): string {
    return `${this.apiMicroBaseUrl}/api/folders/user/${this.userId}/tree`;
  }

  public apiPostFolder(): string {
    return `${this.apiMicroBaseUrl}/api/folders/user/${this.userId}`;
  }

  public apiPatchFolder(folderId: string): string {
    return `${this.apiMicroBaseUrl}/api/folders/user/${this.userId}/folder/${folderId}`;
  }

  public apiPatchFolderPosition(): string {
    return `${this.apiMicroBaseUrl}/api/folders/user/${this.userId}/update-positions`;
  }

  public apiDeleteFolder(folderId: string): string {
    return `${this.apiMicroBaseUrl}/api/folders/user/${this.userId}/folder/${folderId}`;
  }

  public apiMoveToFolder(folderId: string, documentId: string): string {
    return `${this.apiMicroBaseUrl}/api/folders/user/${this.userId}/document/${documentId}/move-to-folder/${folderId}`;
  }

  public apiMoveToRoot(documentId: string): string {
    return `${this.apiMicroBaseUrl}/api/folders/user/${this.userId}/document/${documentId}/move-to-root`;
  }
}
