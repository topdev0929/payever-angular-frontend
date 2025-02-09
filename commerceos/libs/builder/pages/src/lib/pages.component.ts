import { ChangeDetectionStrategy, Component, EventEmitter, Inject, OnDestroy, OnInit, Output } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { Store } from '@ngxs/store';
import { SelectSnapshot } from '@ngxs-labs/select-snapshot';
import { BehaviorSubject, EMPTY, Observable, Subject, merge } from 'rxjs';
import { skip, startWith, switchMap, take, takeUntil, tap } from 'rxjs/operators';

import { PeAppEnv } from '@pe/app-env';
import { PebEditorApi } from '@pe/builder/api';
import { isMasterPage, PebPage } from '@pe/builder/core';
import { getPagePreviewImageUrl } from '@pe/builder/editor-utils';
import { PebOptionsState, PebPagesState } from '@pe/builder/state';
import {
  PeDataGridFilter,
  PeDataGridPaginator,
  PeDestroyService,
  PeGridItem,
  PeGridItemType,
} from '@pe/common';
import {
  FolderService,
  PeFoldersActionsService,
  PeFoldersApiService,
} from '@pe/folders';
import {
  MIN_ITEM_WIDTH,
  PeGridItemsActions,
  PeGridMenu,
  PeGridMenuItem,
  PeGridQueryParamsService,
  PeGridState,
  PeGridView,
} from '@pe/grid';
import { ContactsAppState } from '@pe/shared/contacts';
import {
  FolderItem,
  FolderOutputEvent,
  PeFoldersActionsEnum,
  RootFolderItem,
} from '@pe/shared/folders';


import { PageAlbumInterface } from './pages.constants';
import {
  FOLDERS_SIDENAV_MENU,
  PagesDialogDataInterface,
  SideNavMenuActions,
  TABLE_DISPLAYED_COLUMNS,
  TOOLBAR_CONFIG,
  VIEW_MENU,
} from './pages.interface';


@Component({
  selector: 'peb-pages',
  templateUrl: './pages.component.html',
  styleUrls: ['./pages.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PebPagesComponent implements OnInit, OnDestroy {

  @SelectSnapshot(ContactsAppState.popupMode) popupMode: boolean;

  @Output() createPage = new EventEmitter<any>();

  public readonly gridItems$ = this.store.select(PeGridState.gridItems()).pipe(startWith([]));

  private readonly TOOLBAR_CUSTOM_MENU = [];

  public readonly toolbar$ = new BehaviorSubject<any>({
    ...TOOLBAR_CONFIG,
    customMenus: this.TOOLBAR_CUSTOM_MENU,
  });

  public isLoading$ = new BehaviorSubject<boolean>(false);
  public foldersTree$ = new Subject<FolderItem[]>();
  private onSelectFolder$ = new Subject<FolderItem>();

  public viewMenu: PeGridMenu = VIEW_MENU;
  public foldersSidenavMenu = FOLDERS_SIDENAV_MENU;
  public folderActions = PeFoldersActionsEnum;
  public readonly tableDisplayedColumns = TABLE_DISPLAYED_COLUMNS;
  private folderAction$ = new Subject<[FolderOutputEvent, PeFoldersActionsEnum]>();

  public filters: PeDataGridFilter[] = [];
  public paginator: PeDataGridPaginator = { page: 1, perPage: this.perPageCount(), total: 0 };
  public selectedFolder: FolderItem = null;
  public gridLayout = PeGridView.List;

  private themeId: string;

  public readonly rootFolder: RootFolderItem = {
    _id: null,
    name: 'All pages',
    image: 'assets/icons/folder.svg',
  };

  public viewportTitle: string;

  private albumId: string;

  constructor(
    @Inject(PeAppEnv) private appEnv,
    @Inject(MAT_DIALOG_DATA) public dialogData: PagesDialogDataInterface,
    public dialogRef: MatDialogRef<PebPagesComponent>,
    private editorApi: PebEditorApi,
    private store: Store,
    private peGridQueryParamsService: PeGridQueryParamsService,
    private peFoldersActionsService: PeFoldersActionsService,
    private peFolderService: FolderService,
    private readonly destroy$: PeDestroyService,
    private peFoldersApiService: PeFoldersApiService,
  ) {
    this.themeId = this.dialogData.themeId;
  }

  ngOnInit() {
    this.initGridItems();

    merge(
      this.selectFolderListener$,
      this.initFoldersAction$,
    ).pipe(takeUntil(this.destroy$)).subscribe();
  }

  ngOnDestroy() {
    this.peFoldersApiService.hostPath$.next(null);
  }

  private get initFoldersAction$() {
    return this.folderAction$.pipe(
      switchMap(([event, action]) => {
        const { data } = event;
        let request$: Observable<PageAlbumInterface>;

        switch (action) {
          case PeFoldersActionsEnum.Create:
            request$ = this.editorApi.createPageAlbum<PageAlbumInterface>(this.appEnv.id, this.themeId, data);
            break;
          case PeFoldersActionsEnum.Update:
            request$ = this.editorApi.updatePageAlbum<PageAlbumInterface>(this.appEnv.id, this.themeId, data);
            break;
          case PeFoldersActionsEnum.Delete:
            request$ = this.editorApi.deletePageAlbum<PageAlbumInterface>(this.appEnv.id, this.themeId, data._id);
            break;
          default:
            return EMPTY;
        }

        return request$;
      }),
      tap(() => this.initGridItems()),
    );
  }

  private initGridItems() {
    const pages = this.store.selectSnapshot(PebPagesState.pages);
    const screen = this.store.selectSnapshot(PebOptionsState.screen);

    const action = { label: 'Select', more: false };
    const blank = { id: '', title: 'Blank', type: PeGridItemType.Item, columns: [], action, image: '' };

    const masterItems: GridItem[] = pages.filter(isMasterPage).map(page => ({
      id: page.id,
      title: page.name,
      data: page,
      columns: [],
      image: getPagePreviewImageUrl(page, screen.key),
      type: PeGridItemType.Item,
      action,
    }));

    this.store.dispatch(new PeGridItemsActions.OpenFolder([blank, ...masterItems]));
  }

  private get selectFolderListener$() {
    return this.onSelectFolder$
      .pipe(
        skip(1),
        tap((folder: FolderItem) => {
          const isRootFolder = !folder?._id;
          this.selectedFolder = !isRootFolder ? folder : null;
          this.peFoldersActionsService.lastSelectedFolderId = folder?._id;
          this.peGridQueryParamsService.folderToParams(folder?._id);
          this.viewportTitle = isRootFolder ? this.rootFolder.name : folder.name;
          this.paginator.page = 1;
          this.paginator.total = 0;
          this.store.dispatch(new PeGridItemsActions.OpenFolder([]));
          this.setGridItems(folder);
        }));
  }

  public get showAddNewItem(): boolean {
    return !this.selectedFolder?.isProtected;
  };

  public select({ data }: GridItem) {
    this.dialogRef.close({ masterPage: data });
  }

  public folderAction(event: FolderOutputEvent, action: PeFoldersActionsEnum): void {
    this.folderAction$.next([event, action]);
  }

  public menuItemSelected(menuItem: PeGridMenuItem): void {
    if (menuItem.value === SideNavMenuActions.NewFolder) {
      this.peFolderService.createFolder('New Folder');
    }
  }

  public onSelectFolder(folder: FolderItem): void {
    this.onSelectFolder$.next(folder);
  }

  private setGridItems(folder: FolderItem): void {
    if (!folder?._id) { return; }

    this.isLoading$.next(true);
    this.albumId = folder._id;

    const shopId = this.appEnv.id;
    const themeId = this.themeId;
    const albumId = folder._id;

    this.editorApi.getPageByAlbum(shopId, themeId, albumId)
      .pipe(
        take(1),
        tap((gridItems) => {

          if (gridItems.length) {
            const parsedItem = gridItems.map((item) => {
              const result = {
                id: item.id,
                title: item.name,
                selected: false,
                itemLoader$: new BehaviorSubject<boolean>(false),
                status: 'DRAFT',
                action: {
                  label: 'Add',
                },
                columns: [
                  {
                    name: 'name',
                    value: 'name',
                  },
                  {
                    name: 'action',
                    value: 'action',
                  },
                ],
                image: 'assets/icons/folder-grid.png',
                type: PeGridItemType.Item,
              };

              return result as PeGridItem;
            });

            console.log({ parsedItem });

            this.store.dispatch(new PeGridItemsActions.OpenFolder(parsedItem));
          }

          this.isLoading$.next(false);
        }),
      ).subscribe();
  }

  close() {
    this.dialogRef.close();
  }

  private perPageCount(): number {
    const items = Math.ceil(window.innerWidth / MIN_ITEM_WIDTH * (window.innerHeight / MIN_ITEM_WIDTH));

    return Math.ceil(items + items / 4);
  }
}


interface GridItem extends PeGridItem {
  data?: PebPage;
}
