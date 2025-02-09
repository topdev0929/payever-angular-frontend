import {
  ChangeDetectionStrategy, ChangeDetectorRef, Component, Inject, Input,
  OnInit,
  ViewEncapsulation,
} from '@angular/core';
import { FormControl } from '@angular/forms';
import { filter, takeUntil, tap } from 'rxjs/operators';

import { EnvironmentConfigInterface, MenuSidebarFooterData, PeDestroyService, PE_ENV } from '@pe/common';
import { PeOverlayConfig, PeOverlayWidgetService } from '@pe/overlay-widget';
import { TranslateService } from '@pe/i18n-core';
import { PeContextMenuService } from '@pe/ui';

import { PeMessageFolder, PeMessageSettingsThemeItem } from '../../interfaces';
import { PeMessageContextMenu } from '../../enums';
import { PeMessageApiService, PeMessageChatRoomListService, PeMessageNavService, PeMessageService } from '../../services';
import { PeMessageFolderFormComponent } from '../message-folder-form';
import { liveChatFoldersMock } from '../../liver-chat-folders.mock';

@Component({
  selector: 'pe-message-nav',
  templateUrl: './message-nav.component.html',
  styleUrls: ['./message-nav.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [PeDestroyService],
  encapsulation: ViewEncapsulation.None,
})
export class PeMessageNavComponent implements OnInit {

  @Input() theme = 'dark';

  messageAppColor = '';
  folderList: PeMessageFolder[] = [];
  folderControl = new FormControl();
  menuData: MenuSidebarFooterData = {
    headItem: { title: this.translateService.translate('message-app.sidebar.add_new') },
    menuItems: [{
      title: this.translateService.translate('message-app.sidebar.folder'),
      onClick: () => {
        const value = this.folderControl.value;
        const selectedFolder: PeMessageFolder = {
          _id: value?.length ? value[0]._id : null,
        };
        this.openFolderFormOverlay(PeMessageContextMenu.Create, selectedFolder);
      },
    }],
  };

  constructor(
    public peMessageNavService: PeMessageNavService,
    public translateService: TranslateService,
    private destroyed$: PeDestroyService,
    private changeDetectorRef: ChangeDetectorRef,
    private peContextMenuService: PeContextMenuService,
    private peOverlayWidgetService: PeOverlayWidgetService,
    private peMessageApiService: PeMessageApiService,
    private peMessageChatRoomListService: PeMessageChatRoomListService,
    private peMessageService: PeMessageService,
    @Inject(PE_ENV) private environmentConfigInterface: EnvironmentConfigInterface,
  ) {
  }

  ngOnInit(): void {
    if (this.peMessageService.isLiveChat) {
      this.peMessageService.currSettings$.pipe(
        filter((themeItem: PeMessageSettingsThemeItem) => themeItem._id !== undefined),
        tap((themeItem: PeMessageSettingsThemeItem) => {
          this.messageAppColor = themeItem.settings?.messageAppColor || '';

          this.changeDetectorRef.detectChanges();
        }),
        takeUntil(this.destroyed$),
      ).subscribe();
    }

    if (!this.peMessageService.isLiveChat) {
      this.getFolderList();
    } else {
      this.folderList = liveChatFoldersMock;
      this.peMessageNavService.folderTree = this.getFolderTree(liveChatFoldersMock);

      this.changeDetectorRef.markForCheck();
      this.changeDetectorRef.detectChanges();
    }

    this.handleActiveFolder();
  }

  openContextMenu(event: MouseEvent, folder: PeMessageFolder): void {
    event.preventDefault();
    event.stopPropagation();

    const contextMenu = {
      title: this.translateService.translate('message-app.sidebar.options'),
      list: [
        { label: this.translateService.translate('message-app.sidebar.create'), value: PeMessageContextMenu.Create },
        { label: this.translateService.translate('message-app.sidebar.edit'), value: PeMessageContextMenu.Edit },
        { label: this.translateService.translate('message-app.sidebar.delete'), value: PeMessageContextMenu.Delete, red: true },
      ],
    };

    const config = {
      theme: this.theme,
      data: contextMenu,
    };

    this.peContextMenuService.open(event, config).afterClosed.pipe(
      tap((e: PeMessageContextMenu) => {
        switch (e) {
          case PeMessageContextMenu.Create:
            this.openFolderFormOverlay(e, folder);
            break;
          case PeMessageContextMenu.Edit:
            this.openFolderFormOverlay(e, folder);
            break;
          case PeMessageContextMenu.Delete:
            if (folder._id) {
              this.deleteFolder(folder._id);
            }
            break;
        }
      }),
      takeUntil(this.destroyed$),
    ).subscribe();
  }

  private createFolder(folder: PeMessageFolder): void {
    this.peMessageApiService.postFolder(folder).pipe(
      tap((createdFolder: PeMessageFolder) => {
        this.folderList.push(createdFolder);
        this.peMessageNavService.folderTree = [];
        this.changeDetectorRef.detectChanges();

        this.peMessageNavService.folderTree = this.getFolderTree(this.folderList);
        this.changeDetectorRef.detectChanges();
      }),
      takeUntil(this.destroyed$)
    ).subscribe();
  }

  private deleteFolder(folderId: string): void {
    this.peMessageApiService.deleteFolder(folderId).pipe(
      tap((deletedFolder: PeMessageFolder) => {
        this.folderList = this.folderList.filter(f => f._id !== deletedFolder._id);
        this.peMessageNavService.folderTree = [];
        this.changeDetectorRef.detectChanges();

        this.peMessageNavService.folderTree = this.getFolderTree(this.folderList);
        this.changeDetectorRef.detectChanges();
      }),
      takeUntil(this.destroyed$)
    ).subscribe();
  }

  private getFolderList(): void {
    this.peMessageApiService.getFolderList().pipe(
      tap((folders: PeMessageFolder[]) => {
        this.folderList = folders;
        this.peMessageNavService.folderTree = this.getFolderTree(folders);

        this.changeDetectorRef.detectChanges();
      }),
      takeUntil(this.destroyed$)
    ).subscribe();
  }

  private getFolderTree(folderList: PeMessageFolder): any {
    const map = [];
    const folderTree = [];

    let node;
    let i = 0;

    for (i = 0; i < folderList.length; i += 1) {
      map[folderList[i]._id] = i;
      folderList[i].children = [];
      folderList[i].image = folderList[i].image ?? this.environmentConfigInterface.custom.cdn + '/icons-png/dashboard-filter-copy.png';
    }

    for (i = 0; i < folderList.length; i += 1) {
      node = folderList[i];
      if (node.parentFolder !== undefined && node.parentFolder !== null) {
        if (folderList[map[node.parentFolder]]) folderList[map[node.parentFolder]].children.push(node);
      } else {
        folderTree.push(node);
      }
    }

    for (i = 0; i < folderList.length; i += 1) {
      node = folderList[i];
      if (node.children.length === 0) {
        node.noToggleButton = true;
      } else {
        node.noToggleButton = false;
      }
    }

    return folderTree;
  }

  private handleActiveFolder(): void {
    this.folderControl.valueChanges.pipe(
      tap((value: PeMessageFolder[]) => {
        if (!this.peMessageService.isLiveChat) {
          this.peMessageChatRoomListService.getConversationList(value.length ? value[0]._id : undefined);
        }
        this.peMessageNavService.activeFolder = value;
      }),
      takeUntil(this.destroyed$),
    ).subscribe();
  }

  private openFolderFormOverlay(event: PeMessageContextMenu, folder: PeMessageFolder): void {
    if (event === PeMessageContextMenu.Create) {
      folder = { parentFolder: folder?._id } as any;
    }

    const peOverlayConfig: PeOverlayConfig = {
      data: {
        folder: folder,
        theme: this.theme,
      },
      hasBackdrop: true,
      headerConfig: {
        title: folder.name ?? this.translateService.translate('message-app.sidebar.new_folder'),
        backBtnTitle: this.translateService.translate('message-app.sidebar.close'),
        backBtnCallback: () => {
          this.peOverlayWidgetService.close();
        },
        doneBtnTitle: this.translateService.translate('message-app.sidebar.save'),
        doneBtnCallback: () => {
          const value = peOverlayConfig.data.newFolder;

          for (const propName in value) {
            if (value[propName] === null || value[propName] === undefined) {
              delete value[propName];
            }
          }

          if (value) {
            if (value._id) {
              this.updateFolder(value);
            } else {
              this.createFolder(value);
            }
          }

          this.peOverlayWidgetService.close();
        },
        theme: this.theme
      },
      component: PeMessageFolderFormComponent,
    };

    this.peOverlayWidgetService.open(peOverlayConfig);
  }

  private updateFolder(folder: PeMessageFolder): void {
    this.peMessageApiService.patchFolder(folder).pipe(
      tap((updatedFolder: PeMessageFolder) => {
        this.folderList = this.folderList.map(f => f._id !== updatedFolder._id ? f : updatedFolder);
        this.peMessageNavService.folderTree = this.getFolderTree(this.folderList);

        this.changeDetectorRef.detectChanges();
      }),
      takeUntil(this.destroyed$),
    ).subscribe();
  }

  closeFolder(): void {
    this.peMessageNavService.activeFolder = [];
  }
}
