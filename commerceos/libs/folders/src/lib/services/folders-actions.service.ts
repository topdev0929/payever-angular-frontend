import { Injectable } from '@angular/core';
import { Observable, of, OperatorFunction, Subject } from 'rxjs';
import { catchError, switchMap, tap } from 'rxjs/operators';

import { TranslateService } from '@pe/i18n-core';
import { PeFoldersActionsEnum } from '@pe/shared/folders';
import {
  FolderApply,
  FolderItem,
  FolderOutputEvent,
  FolderPosition,
} from '@pe/shared/folders';
import { SnackbarService } from '@pe/snackbar';

import {
  PeFoldersPositionItemInterface,
  PeFoldersUpdatePositionsInterface,
} from '../interfaces';

import { FolderService } from './folder.service';
import { PeFoldersApiService } from './folders-api.service';

@Injectable()
export class PeFoldersActionsService {

  public readonly folderChange$ = new Subject<{ folder: FolderItem, action: PeFoldersActionsEnum }>();
  public lastSelectedFolderId: string = null;

  constructor(
    private peFolderService: FolderService,
    private peFoldersApiService: PeFoldersApiService,
    private snackbarService: SnackbarService,
    private translateService: TranslateService,
  ) { }

  public folderAction(event: FolderOutputEvent, action: PeFoldersActionsEnum): Observable<any> {
    if (event?.data) {
      const targetFolder = event.data;
      const isActionCreate = action === PeFoldersActionsEnum.Create;
      const isActionDelete = action === PeFoldersActionsEnum.Delete;
      const dataIfNotCreateAction = !isActionCreate
        ? { _id: targetFolder._id }
        : { };
      const dataIfNotDeleteAction = !isActionDelete
        ? {
            parentFolderId: targetFolder.parentFolderId,
            position: targetFolder.position,
            image: targetFolder.image,
            name: targetFolder.name,
            isHeadline: targetFolder.isHeadline,
          }
        : { };

      const folderData = {
        ...dataIfNotCreateAction,
        ...dataIfNotDeleteAction,
      };

      const action$ = of(folderData as FolderItem)
        .pipe(
          switchMap((folder) => {
            if (isActionCreate) {
              return this.peFoldersApiService.createFolder(folder)
            }
            if (isActionDelete) {
              return this.peFoldersApiService.deleteFolder(folder._id)
            }
            return  this.peFoldersApiService.updateFolder(folder);
          }),
          tap((folder: FolderItem) => {
            this.applyEvent(
              event,
              isActionDelete ? null : this.applyFolderMapper(folder),
            );
            if (!targetFolder.isHeadline) {
              this.folderChange$.next({
                folder: isActionDelete ? targetFolder : folder,
                action: action,
              });
            } else if (isActionDelete) {
              this.peFolderService.deleteNode$.next(folderData._id);
            }
          }),
          this.errorHandler(event));

      return action$;
    }

    return of(null);
  }

  public onUpdatePositions(positions: FolderPosition[]): Observable<any> {
    const preparePositions: PeFoldersPositionItemInterface[] = positions
      .map((position: FolderPosition): PeFoldersPositionItemInterface => {
        return { _id: position._id, position: position.position };
      });
    const updatePositions: PeFoldersUpdatePositionsInterface = { positions: preparePositions };

    return positions?.length
      ? this.peFoldersApiService.updatePositions(updatePositions)
      : of(null);
  }

  private applyEvent(event: FolderOutputEvent, payload: FolderApply | null): void {
    event.apply && event.apply(payload);
  }

  private applyFolderMapper(folder: FolderItem): FolderApply | null {
    return !folder
      ? null
      : {
          _id: folder._id,
          name: folder.name,
          image: folder?.image || null,
          parentFolderId: folder?.parentFolderId || null,
        };
  }

  public errorHandler(event: FolderOutputEvent): OperatorFunction<any, any> {
    return catchError((error) => {
      const defaultMessage = error
        ? 'folders.action.error.unknown_error'
        : 'app.employee-permission.insufficient.error';

      event && this.applyEvent(event, null);

      let errorMessage: string
      if (error?.message.split('.')[0] === 'folders'){
        errorMessage = error.message;
      } else if (error?.error?.message.split('.')[0] === 'folders') {
        errorMessage = error.error.message;
      } else if (error?.errors?.split('.')[0] === 'folders') {
        errorMessage = error.errors;
      } else {
        errorMessage = defaultMessage;
      }

      const folderData = event?.data;

      if (errorMessage && folderData?.name) {
        const folderIntroMessage = this.translateService.translate('folders.action.error.folder_intro_message');
        const headlineIntroMessage = this.translateService.translate('folders.action.error.headline_intro_message');
        const message = this.translateService.translate(errorMessage);
        const notify = `${folderData.isHeadline ? headlineIntroMessage : folderIntroMessage} "${folderData.name}": ${message}`;

        this.showWarning(notify);
      }

      return of(true);
    });
  }

  public showWarning(notification: string): void {
    this.snackbarService.toggle(
      true,
      {
        content: notification,
        duration: 15000,
        iconColor: '#E2BB0B',
        iconId: 'icon-alert-24',
        iconSize: 24,
      }
    );
  }
}
