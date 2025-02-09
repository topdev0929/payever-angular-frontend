import { HttpClient } from "@angular/common/http";
import { Inject, Injectable } from "@angular/core";
import { Observable } from "rxjs";

// eslint-disable-next-line @nrwl/nx/enforce-module-boundaries
import { PeAuthService } from "@pe/auth";
// eslint-disable-next-line @nrwl/nx/enforce-module-boundaries
import { CosEnvService } from "@pe/base";
import { EnvService } from "@pe/common";
import { FolderItem } from "@pe/shared/folders";

import { PE_MESSAGE_API_PATH } from "../../../services";

@Injectable()
export class PeMessageFoldersApiService {

  constructor(
    private envService: EnvService,
    private cosEnvService: CosEnvService,
    private httpClient: HttpClient,
    private peAuthService: PeAuthService,
    @Inject(PE_MESSAGE_API_PATH) private peMessageApiPath: string,
  ) { }


  private get businessId(): string {
    return this.envService.businessId;
  }

  private get isPersonalMode(): boolean {
    return this.cosEnvService.isPersonalMode;
  }

  private get currentUserId(): string {
    return this.peAuthService.getUserData().uuid;
  }


  private get foldersPath(): string {
    return this.isPersonalMode
      ? `${this.peMessageApiPath}/api/folders/user/${this.currentUserId}`
      : `${this.peMessageApiPath}/api/folders/business/${this.businessId}`;
  }

  public getFolderTree(): Observable<FolderItem[]> {
    return this.httpClient.get<FolderItem[]>(`${this.foldersPath}/tree`);
  }

  public getRootFolder(): Observable<FolderItem> {
    const postfixEndpoint = this.isPersonalMode ? '' : `/root-folder`;

    return this.httpClient.get<FolderItem>(`${this.foldersPath}${postfixEndpoint}`);
  }

  public removeLocation(conversationId: string, folderId: string): Observable<any> {
    return this.httpClient.delete(`${this.foldersPath}/document/${conversationId}/locations/${folderId}`);
  }
}
