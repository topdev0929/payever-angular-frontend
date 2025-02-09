import {
  AfterViewInit,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  Inject,
  Input,
  OnChanges,
  OnDestroy,
  OnInit,
  Optional,
  SimpleChanges,
} from '@angular/core';
import { Store } from '@ngxs/store';
import { BehaviorSubject, fromEvent, merge, of, Subject } from 'rxjs';
import {
  catchError,
  map,
  pairwise,
  switchMap,
  take,
  takeUntil,
  tap,
} from 'rxjs/operators';

import { AppType, APP_TYPE, PeDestroyService, PePreloaderService } from '@pe/common';
import {
  FolderService,
  PeFoldersActionsService,
} from '@pe/folders';
import {
  PeFoldersActions,
  PeGridMenuItem,
  PeGridService,
  PeGridSidenavService,
  PeGridStoreActions,
} from '@pe/grid';
import { TranslateService } from '@pe/i18n-core';
import {
  PeMessageAppService,
  PeMessageFoldersApiService,
  PeMessageSideNavMenuActions,
  PeMessageSidenavsEnum,
  PeMessageService,
} from '@pe/message/shared';
import { PePlatformHeaderConfig, PePlatformHeaderService } from '@pe/platform-header';
import {
  FolderItem,
  FolderOutputEvent,
  FolderPosition,
} from '@pe/shared/folders';
import { PeFoldersActionsEnum } from '@pe/shared/folders';

import { liveChatFoldersMock } from '../../chat-folders.mock';
import { MessageRuleService } from '../../services';

import { PE_MESSAGE_FOLDERS_MENU } from './message-nav-menu.constant';


@Component({
  selector: 'pe-message-nav',
  templateUrl: './message-nav.component.html',
  styleUrls: ['./message-nav.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [PeDestroyService, PeGridService],
})
export class PeMessageNavComponent implements OnInit, OnDestroy, OnChanges, AfterViewInit {

  @Input() mobileView = false;
  @Input() isLiveChat = false;
  @Input() isEmbedChat = false;
  @Input() theme;
  @Input() messageWidgetBg = '';
  @Input() blurMode = false;

  isLiveInCos = false;
  readonly folderActions = PeFoldersActionsEnum;

  public readonly rootFolder: FolderItem = {
    _id: null,
    children: [],
    name: this.translateService.translate('message-app.sidebar.all_messages'),
    position: 0,
  };

  private readonly isFoldersLoading$ = new BehaviorSubject<boolean>(true);

  public selectedFolder: FolderItem;
  public readonly sidenavMenu = !this.isEmbedMode
    ? PE_MESSAGE_FOLDERS_MENU
    : null;

  public readonly folderTree$ = new Subject<FolderItem[]>();
  private readonly foldersUpdatedListener$ = this.peFoldersActionsService.folderChange$
    .pipe(
      tap(({ folder, action }) => {
        this.restructureFoldersTree(folder, action);
      }));

  private readonly toggleSidenavStatus$ = this.peGridSidenavService.toggleOpenStatus$
    .pipe(
      tap((active: boolean) => {
        !this.isLiveChat && this.peGridSidenavService.sidenavOpenStatus[PeMessageSidenavsEnum.ConversationList].value
          && this.pePlatformHeaderService.toggleSidenavActive(PeMessageSidenavsEnum.Folders, active);
        this.cdr.detectChanges();
      }));

  private readonly windowResize$ = fromEvent(window, 'resize')
    .pipe(
      map(() => window.innerWidth <= 1080),
      pairwise(),
      tap(([prev, curr]) => {
        prev !== curr && this.changeHeaderConfig(curr);
        prev !== curr && !curr && this.peGridSidenavService
          .sidenavOpenStatus[PeMessageSidenavsEnum.ConversationList].next(true);
      }));

  constructor(
    private cdr: ChangeDetectorRef,
    private store: Store,

    @Inject(APP_TYPE) private appType: AppType,
    private peFoldersActionsService: PeFoldersActionsService,
    private peFolderService: FolderService,
    private peGridService: PeGridService,
    private peGridSidenavService: PeGridSidenavService,
    @Optional() private pePlatformHeaderService: PePlatformHeaderService,
    private pePreloaderService: PePreloaderService,
    private translateService: TranslateService,
    private readonly destroy$: PeDestroyService,

    private messageRuleService: MessageRuleService,
    private peMessageService: PeMessageService,
    private peMessageFoldersApiService: PeMessageFoldersApiService,
    private peMessageAppService: PeMessageAppService,

  ) {
    (window as any)?.PayeverStatic?.IconLoader?.loadIcons([
      'widgets',
    ]);

    (window as any)?.PayeverStatic?.SvgIconsLoader?.loadIcons([
      'file-14',
      'social-whatsapp-12',
      'social-telegram-18',
      'social-instagram-12',
    ]);

    this.pePreloaderService.startLoading(this.appType);
    this.pePreloaderService.initFinishObservers([this.isFoldersLoading$], this.appType);
  }

  public get isEmbedMode(): boolean {
    return this.peMessageService.isLiveChat || this.peMessageService.isEmbedChat;
  }

  public get isNotMobile(): boolean {
    return window.innerWidth > 720;
  }

  ngOnDestroy(): void {
    this.pePlatformHeaderService.removeSidenav(PeMessageSidenavsEnum.Folders);
    if (this.isLiveChat && !this.isLiveInCos || this.isLiveInCos && !this.isLiveChat){
      this.store.dispatch(new PeGridStoreActions.Clear(this.appType));
    }
  }

  ngOnInit(): void {
    const { isEmbedChat, isLiveChat } = this.peMessageService;
    this.initFolders(isLiveChat);
    !isEmbedChat && !isLiveChat && this.addMobileHeader();

    merge(
      this.foldersUpdatedListener$,
      this.toggleSidenavStatus$,
      this.windowResize$,
    ).pipe(takeUntil(this.destroy$)).subscribe();

    this.messageRuleService.initRuleListener().pipe(
      takeUntil(this.destroy$)
    ).subscribe();

    this.cdr.detectChanges();
  }

  ngAfterViewInit(): void {
    (window.innerWidth <= 1080 || this.isEmbedChat || this.isLiveChat)
      && this.peGridSidenavService.toggleOpenStatus$.next(false);
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes.theme?.currentValue) {
      this.peGridService.theme  = changes.theme?.currentValue;
      this.cdr.detectChanges();
    }
  }

  private initFolders(isLiveChat: boolean) {
    this.store.dispatch(new PeGridStoreActions.Create(this.appType));
    if (isLiveChat) {
      this.folderTree$.next(liveChatFoldersMock);
      this.isFoldersLoading$.next(false);
    }
    else {
      const treeFolder$ = this.peMessageFoldersApiService.getFolderTree().pipe(
        map(tree => tree.filter((folder: any) => folder.scope !== 'default')),
        tap((tree) =>  {
          this.folderTree$.next(tree);
          this.isFoldersLoading$.next(false);
          this.store.dispatch(new PeFoldersActions.InitFoldersTree(tree, null, this.appType));
        }));

        const rootFolder$ = this.peMessageFoldersApiService.getRootFolder().pipe(
          catchError(err => of({ _id: null })),
          tap((rootFolder) => {
             this.rootFolder._id = rootFolder._id;
             this.peMessageAppService.rootFolderId = rootFolder._id;
            }),
          );

        merge(
          treeFolder$,
          rootFolder$
        ).pipe(
          tap(()=> this.isFoldersLoading$.next(false)),
          takeUntil(this.destroy$)
        ).subscribe();
    }
  }

  private addMobileHeader(): void {
    this.pePlatformHeaderService.assignSidenavItem({
      name: PeMessageSidenavsEnum.Folders,
      active: this.peGridSidenavService.toggleOpenStatus$.value,
      item: {
        title: this.translateService.translate(PeMessageSidenavsEnum.Folders),
        iconType: 'vector',
        icon: '#icon-arrow-left-48',
        iconDimensions: {
          width: '12px',
          height: '20px',
        },
        onClick: () => {
          this.peGridSidenavService.toggleViewSidebar();
        },
      },
    });

    this.changeHeaderConfig(window.innerWidth <= 720);
  }

  private changeHeaderConfig(isMobile: boolean): void {
    this.pePlatformHeaderService.assignConfig({
      isShowDataGridToggleComponent: !isMobile,
      isShowMobileSidenavItems: isMobile,
      isShowSubheader: isMobile,
    } as PePlatformHeaderConfig);
  }

  private restructureFoldersTree(folder: FolderItem, action: PeFoldersActionsEnum): void {
    const selectedFolderId = this.selectedFolder?._id;

    switch (action) {
      case PeFoldersActionsEnum.Create:
        this.store.dispatch(new PeFoldersActions.Create(folder, selectedFolderId, this.appType));
        break;
      case PeFoldersActionsEnum.Update:
        this.store.dispatch(new PeFoldersActions.Update(folder, selectedFolderId, this.appType));
        break;
      case PeFoldersActionsEnum.Delete:
        this.store.dispatch(new PeFoldersActions.Delete(folder, this.appType));
        this.peFolderService.deleteNode$.next(folder._id);
        break;
    }
  }

  public folderAction(event: FolderOutputEvent, action: PeFoldersActionsEnum): void {
    const { data } = event;
    const prepareFolder = (folder: FolderItem<any>) => {
      if (action === PeFoldersActionsEnum.Delete) {
        folder._id === this.selectedFolder?._id && this.onSelectFolder(this.rootFolder);
      } else {
        folder.parentFolderId = folder.parentFolderId ?? this.rootFolder._id;
      }
    };

    data && prepareFolder(data);
    this.peFoldersActionsService.folderAction(event, action)
      .pipe(
        take(1),
        takeUntil(this.destroy$))
      .subscribe();
  }

  public menuItemSelected(menuItem: PeGridMenuItem): void {
    switch (menuItem.value) {
      case PeMessageSideNavMenuActions.Folder: {
        const folder = this.translateService.translate('folders.action.create.new_folder');
        this.peFolderService.createFolder(folder);
        break;
      }
      case PeMessageSideNavMenuActions.Headline: {
        const headline = this.translateService.translate('folders.action.create.new_headline');
        this.peFolderService.createHeadline(headline);
        break;
      }
      case PeMessageSideNavMenuActions.Rules: {
        this.messageRuleService.openRules(this.theme);
        break;
      }
    }
  }

  public onPositionsChanged(positions: FolderPosition[]): void {
    this.peFoldersActionsService.onUpdatePositions(positions)
      .pipe(
        switchMap(() => this.peMessageFoldersApiService.getFolderTree()),
        tap((tree: FolderItem[]) => {
          this.store.dispatch(new PeFoldersActions.InitFoldersTree(tree, this.selectedFolder?._id, this.appType));
        }),
        takeUntil(this.destroy$))
      .subscribe();
  }

  public onSelectFolder(folder: FolderItem): void {
    this.selectedFolder = folder?._id !== this.rootFolder._id ? folder : null;
    this.peMessageAppService.setChannelsToShowBasedOnFolder(this.selectedFolder);
  }
}
