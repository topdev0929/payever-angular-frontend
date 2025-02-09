import { ChangeDetectionStrategy, Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { Select, Store } from '@ngxs/store';
import produce from 'immer';
import { BehaviorSubject, Observable, Subject, of } from 'rxjs';
import { filter, map, shareReplay, takeUntil, tap, withLatestFrom, switchMap } from 'rxjs/operators';

import { PeAppEnv } from '@pe/app-env';
import { PeAuthService } from '@pe/auth';
import { PebWebsocketService } from '@pe/builder/api';
import { PebSelectShapeAlbumAction, PebShapesState } from '@pe/builder/state';
import {
  PeDataGridPaginator,
  PeDestroyService,
  StartLoading,
  StopLoading,
} from '@pe/common';
import {
  FolderService,
} from '@pe/folders';
import {
  GRID_LIST_ITEMS_TYPES,
  GridQueryParams,
  PeGridItem,
  PeGridItemsActions,
  PeGridMenu,
  PeGridMenuItem,
  PeGridQueryParamsService,
  PeGridService,
  PeGridSortingInterface,
  PeGridState,
  PeGridView,
  PeGridViewportService,
} from '@pe/grid';
import { PeFilterChange, PeGridSearchFiltersInterface } from '@pe/grid/shared';
import { TranslateService } from '@pe/i18n-core';
import {
  FolderItem,
  FolderOutputEvent,
  PeFoldersActionsEnum,
} from '@pe/shared/folders';

import { DefaultFolderIds } from './create-shape/enums';
import {
  ContextMenu,
  DEFAULT_ORDER_BY,
  FOLDERS_SIDENAV_MENU,
  ITEM_CONTEXT_MENU,
  SideNavMenuActions,
  TABLE_DISPLAYED_COLUMNS,
  TOOLBAR_CONFIG,
  VIEW_MENU,
  VIEWPORT_CONTEXT_MENU,
} from './shapes.interface';
import { PebShapesService } from './shapes.service';

@Component({
  selector: 'peb-shapes',
  templateUrl: './shapes.component.html',
  styleUrls: ['./shapes.component.scss'],
  providers: [PeDestroyService],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PebShapesComponent implements OnInit {
  @Select(PeGridState.gridItems()) gridItemsOrginal$!: Observable<PeGridItem[]>;
  @Select(PebShapesState.selectedAlbum) selectedFolderId$!: Observable<string>;

  private readonly onSelectFolder$ = new Subject<any>();

  public viewportTitle: string;
  public paginator: PeDataGridPaginator;
  public gridLayout = PeGridView.List;
  public scrollBottomOffset = 1;
  public readonly viewMenu: PeGridMenu = VIEW_MENU;
  public readonly foldersSidenavMenu = FOLDERS_SIDENAV_MENU;
  public readonly viewportContextMenu = VIEWPORT_CONTEXT_MENU;
  public readonly itemContextMenu = ITEM_CONTEXT_MENU;
  public readonly toolbar = TOOLBAR_CONFIG;
  public readonly tableDisplayedColumns = TABLE_DISPLAYED_COLUMNS;
  public folderActions = PeFoldersActionsEnum;

  public viewportContextMenu$ = this.onSelectFolder$.pipe(
    filter(folder => !!folder),
    map(folder => folder?.basic === false ? this.viewportContextMenu : []),
  );

  isLoading$: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);

  private sortingOrder: PeGridSortingInterface = DEFAULT_ORDER_BY;
  private pagination = { pageSize: 500 };
  private formattedConfiguration: any = [];
  private selectedFolder?: FolderItem;

  album$ = this.peGridQueryParamsService.getQueryParamByName(GridQueryParams.SelectedFolder);

  total$ = this.shapesService.total$;
  foldersTree$ = this.shapesService.folders$.pipe(
    tap(() => this.store.dispatch(new StopLoading(this.env.type))),
    shareReplay(),
  );

  selectedFolder$ = this.selectedFolderId$.pipe(
    withLatestFrom(this.foldersTree$),
    map(([id, folders]) => {
      let result = null;
      if (id && id !== this.rootFolder._id) {
        result = this.findFolderRecursive(folders, id);
      }
      this.selectedFolder = id === DefaultFolderIds.Root ? { _id: id } : result;
      this.shapesService.loadAlbum(this.getFolderIdsRecursive(this.selectedFolder));

      return result;
    }),
  );

  rootFolder = {
    image: 'assets/icons/folder.svg',
    isHideMenu: true,
    isProtected: true,
    position: 0,
    _id: DefaultFolderIds.Root,
    name: 'All Shapes',
  };

  constructor(
    @Inject(MAT_DIALOG_DATA) public dialogData: any,
    public dialogRef: MatDialogRef<PebShapesComponent>,
    private store: Store,
    private readonly authService: PeAuthService,
    private peFolderService: FolderService,
    private peGridQueryParamsService: PeGridQueryParamsService,
    private destroy$: PeDestroyService,
    private peGridService: PeGridService,
    private peGridViewportService: PeGridViewportService,
    private env: PeAppEnv,
    private shapesService: PebShapesService,
    private readonly websocketService: PebWebsocketService,
    private readonly translateService: TranslateService,
  ) {}

  gridItems$ = this.gridItemsOrginal$.pipe(
    switchMap((items: PeGridItem[])=>{
      if (this.authService.isAdmin()){
        items = produce(items, (draft)=>{
          draft.forEach((_, index)=>{
            draft[index] = { ...draft[index], action:{ ...draft[index].action, more: true } };
          });
        });
      }

      return of(items);
    })
  );

  ngOnInit() {
    this.shapesService.gridItems$.pipe(
      tap((items: PeGridItem[]) => {
        this.store.dispatch([
          new StopLoading(this.env.type),
          new PeGridItemsActions.OpenFolder(items),
        ]);
      }),
      takeUntil(this.destroy$),
    ).subscribe();

    this.websocketService.sessionExpired$
      .pipe(
        tap(() => {
          this.close();
        }),
        takeUntil(this.destroy$),
      )
      .subscribe();

    this.store.dispatch(new StartLoading(this.env.type));
  }

  public get isListView(): boolean {
    return GRID_LIST_ITEMS_TYPES.includes(this.peGridViewportService.view);
  }

  public close() {
    this.dialogRef.close();
  }

  public filtersChange(filters: PeFilterChange[]): void {
    const filterConfiguration = this.peGridService.filtersChange(filters);
    this.formattedConfiguration = this.formatFilters(filterConfiguration);
  }

  public insertElements(event) {
    this.shapesService.insertByShapeId(event.id);
    this.close();
  }

  public itemContextSelect({ gridItem, menuItem }): void {
    if (menuItem.value === ContextMenu.Edit) {
      this.shapesService.updateShape(gridItem);
    } else if (menuItem.value === ContextMenu.Delete) {
      this.shapesService.deleteShape(gridItem.data.id);
    }
  }

  public loadAlbum(album: any): void {
    this.selectFolder(album === null ? DefaultFolderIds.Root : album._id);
  }

  public sortChange(sortingOrder: PeGridSortingInterface): void {
    this.sortingOrder = sortingOrder;
  }

  public menuItemSelected(menuItem: PeGridMenuItem): void {
    if (menuItem.value === SideNavMenuActions.NewFolder) {
      const folder = this.translateService.translate('folders.action.create.new_folder');
      this.peFolderService.createFolder(folder);
    }
  }

  private findFolderRecursive(folders: any, id: string){
    for (let folder of folders) {
      if (folder._id === id) { return folder; }
      if (folder.children?.length > 0) {
        const selecteFolder = this.findFolderRecursive(folder.children, id);
        if (selecteFolder){
          return selecteFolder;
        }
      }
    }

    return  null;
  }

  private getFolderIdsRecursive(folder): string[] {
    let ids: string[] = [folder._id];
      (folder.children || []).forEach((ch)=>{
        ids = [...ids, ...this.getFolderIdsRecursive(ch)];
      });

    return ids;
  }

  private formatFilters(filters: PeGridSearchFiltersInterface) {
    const filtersFormatted = [];

    if (!filters) {
      return filtersFormatted;
    }

    const keys = Object.keys(filters);

    keys.forEach((field) => {
      const filterNames = filters[field];

      filterNames.forEach((filterName) => {
        const condition = filterName.condition;
        filterName.value.forEach((value) => {
          filtersFormatted.push({ field, condition, value });
        });
      });
    });

    return filtersFormatted;
  }

  private selectFolder(id: string): void {
    this.store.dispatch(new PebSelectShapeAlbumAction(id));
  }

  updateAlbum(event: FolderOutputEvent) {
    this.shapesService.updateAlbum(event.data);
  }

  deleteAlbum(event: FolderOutputEvent) {
    this.shapesService.deleteAlbum(event.data);

    if (this.selectedFolder._id === event.data._id) {
      this.selectFolder(null);
    }
  }

  createAlbum(event: FolderOutputEvent) {
    this.shapesService.createAlbum(event.data);
  }
}
