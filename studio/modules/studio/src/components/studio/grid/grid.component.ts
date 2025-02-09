import {
  AfterViewInit,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  ElementRef,
  Injector,
  OnDestroy,
  OnInit,
  TemplateRef,
  ViewChild,
} from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { BehaviorSubject, forkJoin, merge, NEVER, Observable, Subscription } from 'rxjs';
import { HttpErrorResponse, HttpEventType, HttpResponse } from '@angular/common/http';
import { MatDialog } from '@angular/material/dialog';
import { delay, map, switchMap, take, takeUntil, tap } from 'rxjs/operators';
import { FormBuilder, FormControl, FormGroup } from '@angular/forms';
import { Select, Store } from '@ngxs/store';
import * as _ from 'lodash';
import { ConnectionPositionPair, Overlay, OverlayRef } from '@angular/cdk/overlay';
import { ComponentPortal, PortalInjector } from '@angular/cdk/portal';

import {
  AppThemeEnum,
  MenuSidebarFooterData,
  PeDataGridFilter,
  PeDataGridFilterItem,
  PeDataGridItem,
  PeDataGridListOptions,
  PeDataGridMultipleSelectedAction,
  PeDataGridSortByAction,
  PeSearchItem,
  TreeFilterNode,
  MessageBus,
  PeDataGridLayoutType,
  EnvService,
  PeDataGridButtonAppearance
} from '@pe/common';
import {
  DataGridContextMenuEnum,
  PeDataGridComponent,
} from '@pe/data-grid';
import { TreeSidebarFilterComponent } from '@pe/sidebar';

import { PeContextMenuComponent } from './context-menu/context-menu.component';
import { StudioApiService } from '../../../core/services/studio-api.service';
import {
  MediaViewEnum,
  PeCreateAlbumBody,
  PeCreateUserAttributeBody,
} from '../../../core/interfaces/media-details.model';
import { UploadMediaService } from '../../../core/services/uploadMedia.service';
import { PeStudioMedia } from '../../../core/interfaces/studio-media.interface';
import { PeAttribute } from '../../../core/interfaces/studio-attributes.interface';
import { PeStudioCategory } from '../../../core/interfaces/studio-category.interface';
import { PeStudioAlbum } from '../../../core/interfaces/studio-album.interface';
import { DataGridItemsService } from '../../../core/services/data-grid-items.service';
import { StudioAppState } from '../../../core/store/studio.app.state';
import { CreateUserAttribute } from '../../../core/store/attributes.actions';
import {
  CreateCategoryAlbum,
  LoadFolderByParent,
  UpdateAlbum,
} from '../../../core/store/albums.actions';
import { CONTEXT_DATA } from './context-menu/context.common';
import { ClearStudio, UpdateGridItems } from '../../../core/store/items.actions';
import { PeOverlayConfig, PeOverlayWidgetService } from '@pe/overlay-widget';
import { EditFolderComponent } from '../../edit-folder/edit-folder.component';
import { MediaService } from '@pe/media';
import { PeDestroyService } from '@pe/common';

import { EditItemComponent } from '../../edit-item/edit-item.component';
import { ConfirmDialogService } from '../../dialogs/dialog-data.service';
import { SnackBarService, SnackBarVerticalPositionType } from '@pe/forms';
import { PebStudioWsEvents, PeStudioWs } from '../../../core';
import { DomSanitizer } from '@angular/platform-browser';

const OVERLAY_POSITIONS: ConnectionPositionPair[] = [
  {
    originX: 'start',
    originY: 'bottom',
    overlayX: 'start',
    overlayY: 'top',
  },
  {
    originX: 'start',
    originY: 'top',
    overlayX: 'start',
    overlayY: 'bottom',
  },
  {
    originX: 'end',
    originY: 'bottom',
    overlayX: 'end',
    overlayY: 'top',
  },
  {
    originX: 'end',
    originY: 'top',
    overlayX: 'end',
    overlayY: 'bottom',
  },
];

@Component({
  selector: 'pe-studio-grid',
  templateUrl: './grid.component.html',
  styleUrls: ['./grid.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [PeDestroyService],
})
export class PeStudioGridComponent implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild('fileSelector') fileSelector: ElementRef;
  @ViewChild('contextMenu') contextMenu: TemplateRef<any>;
  @ViewChild('mySidebar') treeSidebar: TreeSidebarFilterComponent;
  @ViewChild('studioFolders') studioFolders: TreeSidebarFilterComponent;
  @ViewChild('dataGridComponent') set setDataGrid(dataGrid: PeDataGridComponent) {
    this.showSidebar$.subscribe(show => {
      dataGrid.displayFilters = show;
    });
  }
  saveSubject = new BehaviorSubject(null);

  multipleSelectedActions: PeDataGridMultipleSelectedAction[];
  layoutType: PeDataGridLayoutType = PeDataGridLayoutType.Grid;
  layoutTypeEnum = PeDataGridLayoutType;
  MediaViewEnum = MediaViewEnum;
  mediaView: string = MediaViewEnum.allMedia;
  media: PeStudioMedia[] = [];
  attributes: PeAttribute[];
  searchString$: BehaviorSubject<PeSearchItem> = new BehaviorSubject({
    searchText: null,
    contains: null,
    filter: null,
  });
  uploadingInProgress = false;
  businessId: string;
  imageForAlbumIcon: string;
  isAddToAlbumFormShown = false;
  activeFilters: PeDataGridFilterItem[] = [];
  shouldMediaUpdate = true;
  albumId: string;
  dataGridFilters: PeDataGridFilterItem[];
  dataGridItems: PeDataGridItem[];
  catTreeItems: TreeFilterNode[] = [];
  dataGridListOptions: PeDataGridListOptions = {
    nameTitle: 'Item',
    descriptionTitle: 'Type',
  };

  copiedItem: PeDataGridItem;

  headline: string;
  sortByActions: PeDataGridSortByAction[];
  isFilterCreating = false;
  sidebarFooterData: MenuSidebarFooterData;
  currentThemeStyle: any;
  order: 'asc' | 'desc' = 'desc';
  showSidebarStream$ = new BehaviorSubject<boolean>(window.innerWidth <= 720 ? false : true);
  isActive$: Observable<boolean>;
  isActiveDelete$: Observable<boolean>;
  treeForm: any;
  selectedCategory: PeStudioCategory;
  showSidebar$ = this.showSidebarStream$.asObservable();
  progress;
  files: any;
  secondsLeft = 0;
  treeHeaderActive = false;
  formGroup: FormGroup;
  categoriesForm: FormGroup;
  listItems: TreeFilterNode[] = [];
  searchItems: PeSearchItem[] = [];
  selectedNode: TreeFilterNode = null;
  refreshSubject$ = new BehaviorSubject(true);
  readonly refresh$ = this.refreshSubject$.asObservable();
  @Select(StudioAppState.categories) categories$: Observable<PeStudioCategory[]>;
  @Select(StudioAppState.studioCategories) studioCategories$: Observable<PeStudioCategory[]>;
  @Select(StudioAppState.getItems) gridItems$: Observable<any>;

  private subscription$: Subscription;
  categories: PeStudioCategory[];
  activeTreeNode: TreeFilterNode = undefined;

  constructor(
    private uploadMediaService: UploadMediaService,
    private activatedRoute: ActivatedRoute,
    private cdr: ChangeDetectorRef,
    private studioApiService: StudioApiService,
    private studioWs: PeStudioWs,
    private sanitizer: DomSanitizer,
    public dialog: MatDialog,
    public dataGridItemsService: DataGridItemsService,
    private fb: FormBuilder,
    private messageBus: MessageBus,
    private envService: EnvService,
    private injector: Injector,
    private store: Store,
    private confirmDialog: ConfirmDialogService,
    private overlay: Overlay,
    private destroyed$: PeDestroyService,
    private overlayWidget: PeOverlayWidgetService,
    private mediaService: MediaService,
    private snackBarService: SnackBarService,
  ) {
    this.saveSubject.pipe(takeUntil(this.destroyed$)).subscribe(data => {

      if (data) {
        if (data.method === 'edit') {
          if (data.itemType === 'folder') {

            this.studioApiService.updateAlbum(this.businessId, data.item.id, { ...data.fields, businessId: this.businessId }).
              subscribe(res => {
                data.item.name = res.name;
                data.item.image = this.mediaService.getMediaUrl(res.icon, 'builder');
                data.item.data.description = res.description;
                this.store.dispatch(new UpdateAlbum(res));
                this.refreshSubject$.next(true);
              });
          }
        }
        if (data.method === 'create') {
          if (data.itemType === 'folder') {

            const payload: PeCreateAlbumBody = {
              businessId: this.businessId,
              description: data.fields.description,
              name: data.fields.name,
              parent: data.parentNode?.id,
              icon: this.mediaService.getMediaUrl(data.fields.icon, 'builder'),
              userAttributes: data.parentNode?.id ? [] : [
                {
                  attribute: 0,
                  value: 'My Albums',
                },
              ],
            };

            if (data.parentNode?.id) {
              this.studioApiService.createAlbum(this.businessId, payload).subscribe(res => {
                this.studioWs.getAlbumByParent(data.parentNode.id);
                this.studioWs.on(PebStudioWsEvents.GetStudioAlbumByParent).pipe(
                  tap((treealbums) => {
                    const albums = treealbums.data.albums;
                    data.parentNode.children = albums.map(album => {
                      return {
                        id: album._id,
                        name: album.name,
                        image: album.icon,
                        noToggleButton: !album.hasChildren,
                      };
                    });
                    data.parentNode.noToggleButton = false;
                    this.treeSidebar.treeControl.expand(data.parentNode);
                    this.refreshSubject$.next(true);

                  }),
                  take(1)
                ).subscribe();
              });

            } else {
              const payloadCat: PeCreateAlbumBody = {
                businessId: this.businessId,
                description: data.fields.description,
                name: data.fields.name,
                icon: this.mediaService.getMediaUrl(data.fields.icon, 'builder'),
                parent: null,
              };
              this.studioApiService.createAlbum(this.businessId, payloadCat).subscribe((res) => {
                this.treeSidebar.tree = [
                  ...this.treeSidebar.tree,
                  {
                    editing: false,
                    id: res._id,
                    image: this.mediaService.getMediaUrl(res.icon, 'builder'),
                    name: res.name,
                    parentId: res.parent,
                    noToggleButton: true
                  }
                ];
              });
              this.store.dispatch(new CreateCategoryAlbum(this.businessId, payloadCat, null, this.categories[0]));
              this.refreshSubject$.next(true);
            }
          }
        }
      }
    });
  }

  set showSidebar(value: boolean) {
    this.showSidebarStream$.next(value);
  }

  addActions = [
    {
      label: 'Add Media',
      callback: () => {
        this.fileSelector.nativeElement.click();
      }
    },

  ];
  addItem: PeDataGridItem = {
    id: '0',
    selected: false
  };

  ngOnInit(): void {
    this.setUpTheme();
    this.businessId = this.activatedRoute.parent.snapshot.params.slug;
    this.dataGridItemsService.businessId = this.businessId;
    this.categories$.subscribe(categories => this.categories = _.cloneDeep(categories));

    if (!this.activeTreeNode) {
      this.sidebarFooterData = {
        headItem: {
          title: 'Category'
        },
        menuItems: [
          {
            title: 'Add New Album', onClick: () => {
              this.openOverlay(EditFolderComponent, {
                item: null,
                parentNode: null,
                method: 'create',
                businessId: this.businessId,
                theme: this.currentThemeStyle
              });
            },
          },
        ],
      };
    }
    this.businessId = this.activatedRoute.parent.snapshot.params.slug;
    this.formGroup = this.fb.group({
      tree: [new FormControl()],
      toggle: [true],
    });

    this.categoriesForm = this.fb.group({
      tree: [new FormControl([])],
      toggle: [false],
    });


    this.messageBus.listen('app.studio.sidebarToggle').subscribe(
      (message: boolean) => this.toggleSidebar(!this.showSidebarStream$.value));

    this.sortByActions = [
      {
        label: 'Name',
        callback: () => this.sortMedia('name'),
      },
      {
        label: 'Type',
        callback: () => this.sortMedia('type'),
      },
      {
        label: 'Date',
        callback: () => this.sortMedia('updatedAt'),
      },
    ];
    this.multipleSelectedActions = [
      {
        label: 'Options',
        appearance: PeDataGridButtonAppearance.Button,

        actions: [
          {
            label: 'Select all',
            callback: (ids: string[]) => this.selectAll(),
          },
          {
            label: 'Deselect all',
            callback: (ids: string[]) => this.deselectAll(),
          },
          {
            label: 'Delete',
            callback: (ids: string[]) => this.deleteMedia(ids),
          },
        ],
      },
    ];

    merge(
      this.formGroup.get('tree').valueChanges.pipe(
        tap((treeForm) => {
          this.treeForm = treeForm;
          if (treeForm.length > 0) {
            this.albumId = treeForm[0].id;
            this.activeTreeNode = treeForm[0];
            this.mediaView = MediaViewEnum.ownMedia;
          }
        }),
      ),

      this.searchString$.pipe(
        delay(200),
        switchMap((searchString) => {
          const observables = [
            this.studioApiService.searchUserMedia(this.businessId, searchString.searchText),
          ];
          if (searchString.searchText !== null) {
            observables.push(this.studioApiService.searchSubscriptions(this.businessId, searchString.searchText));
          }
          return forkJoin(observables);
        }),
        tap(([medias, subscriptions]) => {
          if (!this.searchItems.length && this.activeTreeNode) {
            this.changed([this.activeTreeNode], 0);
            this.mediaView = MediaViewEnum.ownMedia;
            this.formGroup.get('tree').setValue([this.activeTreeNode]);
            this.treeSidebar.value = [this.activeTreeNode];
          }
          let data = [
            ...medias,
          ];
          if (subscriptions) {
            data = data.concat(subscriptions);
          }
          if (!data.length && this.searchString$.getValue().searchText === null) {
            return NEVER;
          }
          this.dataGridItemsService.ownUserMedia = data.map((media: PeStudioMedia) => {
            const albumName = this.dataGridItemsService.userAlbums.find(
              (album: PeStudioAlbum) => album._id === media.album,
            )?.name;
            return {
              ...media,
              albumName: albumName ?? 'master',
            };
          });
          this.headline = 'Search Results';
          this.mediaView = MediaViewEnum.allMedia;
          this.formGroup.get('tree').setValue([]);
          this.treeSidebar.value = [];

          this.dataGridItemsService.setDataGridItems(this.dataGridItemsService.ownUserMedia, MediaViewEnum.ownMedia);
          this.cdr.markForCheck();
        }),
      ),
    ).pipe(
      takeUntil(this.destroyed$),
    ).subscribe();
    this.dataGridItemsService.selectedIds = [];
    this.dataGridItemsService.dataGridItems$.subscribe(data => {
      this.studioWs.getAlbumByParent(this.albumId);
      this.studioWs.on(PebStudioWsEvents.GetStudioAlbumByParent).pipe(
        tap((albumsData) => {
          let myAlbums = [];
          const albums = albumsData.data.albums;
          if (albums.length) {

            this.activeTreeNode.children = albums.map(album => {
              return {
                id: album._id,
                name: album.name,
                image: album.icon,
                noToggleButton: !album.hasChildren,
              };
            });


            myAlbums = albums.map(album => {
              return {
                id: album._id,
                title: album.name,
                image: album.url,
                name: album.name,
                type: album.mediaType,
                updatedAt: album.updatedAt,
                data: {
                  isFolder: true,
                  actionButton: {
                    title: 'OPEN',
                    backgroundColor: '#65646d',
                    callback: () => {
                      if (!this.albumId) {
                        // this.activeNode = this.tree.find(item => item.id === folder.id);
                        // this.formGroup.get('tree').setValue([this.activeNode]);
                      } else {
                        const item = this.activeTreeNode.children.find(node => node.id === album._id);
                        console.log(this.activeTreeNode.children, data);
                        this.formGroup.get('tree').setValue([item]);
                        this.activeTreeNode = item;
                      }
                    },
                  },
                },
                customFields: [
                  {},
                  {
                    content: this.sanitizer.bypassSecurityTrustHtml(`
              <button style="
                width: 51px;
                color:${this.currentThemeStyle === AppThemeEnum.light ? 'black;' : 'white;'}
                height: 24px;
                border-radius: 6px;
                background-color: ${this.currentThemeStyle === AppThemeEnum.light ? '#fafafa;' : 'rgba(255, 255, 255, 0.3);'}
                display:block;
                margin:auto;
                border:0;
                outline:0;
                float:right;
                cursor: pointer;
              ">Preview</button>
            `),
                    callback: () => {
                    },
                  }
                ]
              };
            });
          }

          if (albums) {
            this.store.dispatch(new UpdateGridItems([...data, ...myAlbums]));
          }
        }),
        take(1)
      ).subscribe();
    });
  }


  ngAfterViewInit(): void {
    this.formGroup.get('tree').setValue([this.treeSidebar.tree[0]]);
    this.treeSidebar.value = [this.treeSidebar.tree[0]];
    this.cdr.detectChanges();
    this.cdr.markForCheck();
  }


  changeLayout(e): void {
    this.layoutType = e;
  }

  toggleStudioFolders(item): void {
    if (!item.children) {
      this.studioApiService.getSubscriptionFoldersByParrent(item._id).pipe(tap((data) => {
        item.children = data;
        this.store.dispatch(new LoadFolderByParent(_.cloneDeep(this.studioFolders.tree)));
        this.refreshSubject$.next(true);
        this.cdr.detectChanges();
        this.cdr.markForCheck();
      })).subscribe();
    }
  }

  toggleMyFolders(item): void {
    this.studioWs.getAlbumByParent(item.id);
    this.studioWs.on(PebStudioWsEvents.GetStudioAlbumByParent).pipe(
      tap((data) => {
        const albums = data.data.albums;
        item.children = albums.map(album => {
          return {
            id: album._id,
            name: album.name,
            image: album.icon,
            noToggleButton: !album.hasChildren,
          };

        });
        this.refreshSubject$.next(true);

      }),
      take(1)
    ).subscribe();
  }

  setUpTheme(): void {
    this.currentThemeStyle = this.envService.businessData?.themeSettings?.theme ?
      AppThemeEnum[this.envService.businessData?.themeSettings?.theme] : AppThemeEnum.default;
  }

  sortMedia(sortBy: string): void {
    this.order = this.order === 'desc' ? 'asc' : 'desc';
    this.dataGridItemsService.sortByGrid({ order: this.order, sortBy });
  }

  onToggleMedia(view: MediaViewEnum, folderId?: string): void {
    this.mediaView = view;
    this.dataGridItemsService.attributes = [...[], ...this.dataGridItemsService.attributes.map(category => ({
      ...category,
      active: false,
    }))];
    if (view === MediaViewEnum.ownMedia) {
      this.studioApiService.getOwnRootItems(this.businessId)
        .pipe(tap((items: PeStudioMedia[]) =>
          this.dataGridItemsService.setDataGridItems(items, view),
        )).subscribe();
    }
    if (view === MediaViewEnum.allMedia) {
      console.log(folderId);
      forkJoin([
        this.studioApiService.getAllMedia(this.activatedRoute.parent.snapshot.params.slug, {}, folderId),
      ])

        .pipe(tap((items) => {
          this.dataGridItemsService.setDataGridItems(items[0], view);

        }))
        .subscribe();
    }
  }

  onMultipleSelectedItemsChanged(selectedIds: string[]): void {
    this.dataGridItemsService.selectedIds = selectedIds;
  }

  selectAll(): void {
    this.dataGridItemsService.dataGridItems$
      .pipe(map((dataGridItems: PeDataGridItem[]) => dataGridItems.map(item => item.id)),
        switchMap((ids: string[]) => this.dataGridItemsService.selectedIds = ids),
        take(1))
      .subscribe();
  }

  deselectAll(): void {
    this.dataGridItemsService.selectedIds = [];
  }

  onSearchChanged(e): void {
    this.searchItems = [...this.searchItems, e];
    this.searchString$.next(e);
  }

  onSearchRemove(e): void {
    this.searchItems.splice(e, 1);
    this.searchString$.next({ searchText: null, contains: null, filter: null });
  }

  uploadMedia(event): void {

    const fileInput: HTMLInputElement = event.target as HTMLInputElement;
    this.files = fileInput.files;
    let totalSize = 0;

    for (const file of this.files) {
      const size = file.size / 1024 / 1024;
      totalSize += file.size;
      if (size >= 10) {
        this.snackBarService.show('File size can not be larger than 10MB', {
          position: SnackBarVerticalPositionType.Top,
          showClose: true,
          panelClass: 'studio-snackbar',
        });
        fileInput.value = null;
        return;
      }
    }
    this.progress = new BehaviorSubject(0);
    const startTime = (new Date()).getTime();
    this.uploadingInProgress = true;
    if (this.files) {
      for (const file of this.files) {
        this.subscription$ = this.uploadMediaService.postMediaBlob(file, this.businessId)
          .subscribe(
            e => {
              if (e.type === HttpEventType.UploadProgress) {
                const elapsedTime = (new Date().getTime()) - startTime;
                const chunksPerTime = e.loaded / elapsedTime;
                const estimatedTotalTime = e.total / chunksPerTime;
                this.secondsLeft = Math.round((estimatedTotalTime - elapsedTime) / 1000);
                this.progress.next(this.secondsLeft);
                this.cdr.detectChanges();
                this.cdr.markForCheck();

              } else if (e instanceof HttpResponse) {
                this.uploadMediaService.createUserMedia(this.businessId, e, file).pipe(takeUntil(this.destroyed$))
                  .subscribe((peStudioMedia: PeStudioMedia) => {
                    if (this.albumId) {
                      this.uploadMediaService.addAlbumMedia(this.businessId, [peStudioMedia._id], this.albumId)
                        .pipe(takeUntil(this.destroyed$))
                        .subscribe(() => {
                          this.studioApiService.getAlbumMediaById(this.businessId, this.albumId)
                            .pipe(tap((items: PeStudioMedia[]) =>
                              this.dataGridItemsService.setDataGridItems(items, this.albumId),
                            )).subscribe();
                        });
                    }
                  });
                if (this.secondsLeft === 0) {
                  this.uploadingInProgress = false;
                  fileInput.value = null;
                }
              }
            },
            (error: HttpErrorResponse) => {
              this.uploadingInProgress = false;
              fileInput.value = null;
            });
      }
    }

  }

  filesDropped(files: FileList): void {
    this.uploadMedia({ target: { files } } as any);
  }

  onFilterCreate(name): void {
    this.isFilterCreating = false;
    const payload: PeCreateAlbumBody = {
      name,
      businessId: this.businessId,
      parent: null,
    };
    forkJoin([
      this.studioApiService.createAlbum(this.businessId, payload),
      this.dataGridItemsService.filters$,
    ]).pipe(
      tap(([album, filters]) => {

        const albums = filters[1] as PeDataGridFilter;
        albums.items = [
          {
            key: album._id,
            title: album.name,
            category: 'albums',
          } as PeDataGridFilterItem,
          ...albums.items,
        ];
        this.dataGridItemsService.refreshFilters();
      }),
      takeUntil(this.destroyed$),
    ).subscribe();
  }

  onCreateNode(node: TreeFilterNode): void {
    if (node.id === 'new_cat_id') {
      const catPayload = {
        businessId: this.businessId,
        name: node.name,
        type: 'category',
        filterAble: true,
        onlyAdmin: false,
      } as PeCreateUserAttributeBody;
      this.store.dispatch(new CreateUserAttribute(
        this.businessId,
        catPayload,
      ));
      this.cdr.markForCheck();
      this.cdr.detectChanges();
    } else {
      this.refreshSubject$.next(true);
    }
  }

  onCategoryAlbumCreate(node: TreeFilterNode, category): void {
    if (node.id === 'new_cat_id') {

      const catPayload = {
        businessId: this.businessId,
        name: node.name,
        type: 'category',
        filterAble: true,
        onlyAdmin: false,
      } as PeCreateUserAttributeBody;
      this.store.dispatch(new CreateUserAttribute(
        this.businessId,
        catPayload,
      ));
      this.cdr.markForCheck();
      this.cdr.detectChanges();
    } else {

      if (!node.parentId) {
        const payloadCat: PeCreateAlbumBody = {
          businessId: this.businessId,
          description: null,
          name: node.name,
          parent: null,

        };
        category.editing = false;
        this.store.dispatch(new CreateCategoryAlbum(this.businessId, payloadCat, node, category));
        this.refreshSubject$.next(true);
      }
    }
  }

  showAlbumsMenu(): void {
    this.sidebarFooterData = {
      menuItems: [
        {
          title: 'New Category', onClick: () => {
            const categoryPayload = {
              businessId: this.businessId,
              name: 'New Category',
              type: 'category',
              filterAble: true,
              onlyAdmin: false,
            } as PeCreateUserAttributeBody;
            this.store.dispatch(new CreateUserAttribute(
              this.businessId,
              categoryPayload,
            ));
          },
        },
        {
          title: 'New Album', onClick: () => {
          },
        },
      ],
    };
  }

  isUploadingItemVisible(): boolean {
    return !this.uploadingInProgress
      && this.mediaView === MediaViewEnum.ownMedia
      && this.activeFilters?.length < 2
      && (!this.searchString$.getValue() || this.searchString$.getValue().searchText === null);
  }

  cancelUpload($event: boolean): void {
    if ($event) {
      this.subscription$.unsubscribe();
      this.uploadingInProgress = false;
    }
  }

  toggleSidebar(close?: boolean): void {
    this.showSidebar = close;
    this.cdr.markForCheck();
  }

  private deleteMedia(ids: string[]): void {
    this.dataGridItemsService.selectedIds = [];
    const wordsMultiple = ids.length === 1 ? 'this media file' : 'these media files';

    this.confirmDialog.open({
      cancelButtonTitle: 'Cancel',
      confirmButtonTitle: 'Delete Item',
      title: 'Are you sure?',
      subtitle: `Do you really want to delete ${wordsMultiple}? ${wordsMultiple} will be lost and you will not be able to restore it.'`
    });
    this.confirmDialog.onConfirmClick().pipe(
      take(1),
    ).subscribe(() => {
      forkJoin(
        [
          this.dataGridItemsService.removeFromAlbum(ids),
          this.studioApiService.deleteMultipleUserMedia(this.businessId, ids),
        ]
      ).subscribe();
    });
  }

  onOpenPreview(item): void {
    this.dataGridItemsService.openMediaPreview(item.id, this.mediaView);
  }

  clearMyFolder(item): void {
    this.formGroup.get('tree').setValue([]);
    this.treeSidebar.value = [];
    this.headline = item[0].name;
    this.dataGridItemsService.selectedIds = [];
  }

  clearStudioFolder(): void {
    this.categoriesForm.get('tree').setValue([]);
    this.studioFolders.value = [];
    this.headline = null;
    this.dataGridItemsService.selectedIds = [];
  }

  changed(node: any, i): void {
    if ( window.innerWidth <= 720) { this.showSidebarStream$.next(false); }
    if (!node.length) { return; }
    this.selectedCategory = this.categories[i];
    const [treeForm] = node;
    this.activeTreeNode = node[0];
    this.refreshSubject$.next(true);
    this.sidebarFooterData = {
      headItem: {
        title: treeForm.name,
      },
      menuItems: [
        ...this.sidebarFooterData.menuItems
      ],
    };
    if (i === 0) {
      this.studioApiService.getAlbumMediaById(this.businessId, this.activeTreeNode.id)
        .pipe(tap((items: PeStudioMedia[]) =>
          this.dataGridItemsService.setDataGridItems(items, this.mediaView),
        ), takeUntil(this.destroyed$)).subscribe();

    }
    if (i === 1) {
      this.onToggleMedia(MediaViewEnum.allMedia, node[0]._id);
    }
    this.refreshSubject$.next(true);
  }


  nodeContextMenu({ event, node }: { event: MouseEvent, node: TreeFilterNode }): void {
    this.openFolderMenu(event, node);
  }
  studioNodeContextMenu({ event, node }: { event: MouseEvent, node: TreeFilterNode }): void {
    event.preventDefault();
  }

  openFolderMenu(event: MouseEvent, node): void {
    const overlayRef = this.openMenu(event);
    const overlayData = new WeakMap();
    const options = [
      {
        title: 'Edit',
        onClick: () => {
          this.editAlbum(node);
          overlayRef.detach();
        }
      },
      {
        title: 'Copy',
        onClick: () => {
          overlayRef.detach();
        }
      },
      {
        title: 'Paste',
        onClick: () => {
          this.paste(node);
          overlayRef.detach();
        }
      },
      {
        title: 'Duplicate',
        onClick: () => {
          overlayRef.detach();
        }
      },
      {
        title: 'Add Album',
        onClick: () => {
          this.addFolder(node);
          overlayRef.detach();
        }
      },
      {
        title: 'Delete',
        color: 'red',
        onClick: () => {
          this.deleteAlbum(node);
          overlayRef.detach();
        }
      },
    ];

    overlayData.set(CONTEXT_DATA, { options, theme: this.currentThemeStyle });

    this.attachOverlay(overlayRef, overlayData);
  }

  private deleteAlbum(node): void {
    this.confirmDialog.open({
      cancelButtonTitle: 'Cancel',
      confirmButtonTitle: 'Delete Album',
      title: 'Are you sure?',
      subtitle: 'Do you really want to delete Album? All items inside will be lost and you will not be able to restore it.'
    });
    this.confirmDialog.onConfirmClick().pipe(
      take(1),
    ).subscribe(() => {
      this.studioWs.deleteAlbum(node.id);
      this.studioWs.on(PebStudioWsEvents.DeleteStudioAlbum).pipe(
        take(1),
        tap(() => {
        })
      ).subscribe();
      this.refreshSubject$.next(true);
      this.onToggleMedia(MediaViewEnum.ownMedia);
    });
  }

  editAlbum(node): void {
    this.openOverlay(EditFolderComponent, {
      item: node,
      method: 'edit',
      businessId: this.businessId,
      theme: this.currentThemeStyle
    });
  }

  addFolder(node): void {
    this.openOverlay(EditFolderComponent, {
      item: null,
      parentNode: node,
      method: 'create',
      businessId: this.businessId,
      theme: this.currentThemeStyle
    });
  }

  openOverlay(component, data, noPadding = false): void {
    const config: PeOverlayConfig = {
      hasBackdrop: true,
      component,
      data,
      backdropClass: 'settings-backdrop',
      panelClass: 'studio-widget-panel',
      headerConfig: {
        title: data.item?.name || 'New Album',
        backBtnTitle: 'Cancel',
        removeContentPadding: noPadding,
        theme: this.currentThemeStyle,
        backBtnCallback: () => { this.overlayWidget.close(); },
        cancelBtnTitle: '',
        cancelBtnCallback: () => { },
        doneBtnTitle: 'Done',
        doneBtnCallback: () => { },
        onSaveSubject$: this.saveSubject
      }
    };
    this.overlayWidget.open(
      config
    );
  }

  private attachOverlay(overlayRef: OverlayRef, overlayData: WeakMap<any, any>): void {
    const portalInjector = new PortalInjector(this.injector, overlayData);
    const contextMenuPortal = new ComponentPortal(PeContextMenuComponent, null, portalInjector);
    const component = overlayRef.attach(contextMenuPortal);
    component.instance.onClose.pipe(
      take(1),
      tap(() => overlayRef.detach()),
    ).subscribe();
  }

  private openMenu(event: MouseEvent): OverlayRef {
    event.preventDefault();
    const overlayRef = this.overlay.create({
      hasBackdrop: true,
      scrollStrategy: this.overlay.scrollStrategies.reposition(),
      positionStrategy: this.overlay.position()
        .flexibleConnectedTo(event)
        .withFlexibleDimensions(false)
        .withViewportMargin(10)
        .withPositions(OVERLAY_POSITIONS),
    });
    merge(
      overlayRef.backdropClick(),
      this.destroyed$,
    ).pipe(
      tap(() => overlayRef.detach()),
    ).subscribe();
    return overlayRef;
  }

  onGridContentContextMenu(data): void {
    switch (data.event) {
      case DataGridContextMenuEnum.Edit:
        this.edit(data.item);
        break;
      case DataGridContextMenuEnum.Copy:
        this.copy(data.item);
        break;
      case DataGridContextMenuEnum.Paste:
        if (data.item) {
          this.paste(data.item);
          break;
        } else {
          this.paste(null);
          break;
        }
      case DataGridContextMenuEnum.Duplicate:
        this.duplicate(data.item);
        break;
      case DataGridContextMenuEnum.Delete:

        this.delete(data.item);
        break;
    }
  }

  closeContextMenu(): void {
    this.dataGridItemsService.selectedIds = [];
  }

  edit(item): void {
    if (item.data?.isFolder) {
      const folder = this.activeTreeNode.children.find(node => node.id === item.id);
      this.editAlbum(folder);
    } else {
      this.openOverlay(
        EditItemComponent,
        {
          item,
          method: 'edit',
          businessId: this.businessId,
          theme: this.currentThemeStyle
        },
        true
      );
    }
    this.closeContextMenu();
  }

  copy(item): void {
    this.copiedItem = item;
    this.closeContextMenu();
  }

  delete(item): void {
    this.deleteMedia([item.id]);
    this.closeContextMenu();
  }

  duplicate(item): void {
    this.studioApiService.duplicateMedia(this.businessId, {
      userMediaIds: [item.id]
    }).subscribe(data => {
      this.dataGridItemsService.setDataGridItems(data, this.mediaView, false);
    });
    this.closeContextMenu();
  }

  paste(item): void {
    this.studioApiService.duplicateMedia(this.businessId, {
      userMediaIds: [this.copiedItem.id],
      album: (item && item.data?.isFolder) ? item.id : this.albumId
    }).subscribe(data => {
      if (!item || (this.albumId === item.id)) {
        this.dataGridItemsService.setDataGridItems(data, this.mediaView, false);
        this.copiedItem = null;
      }
    });
    this.closeContextMenu();
  }

  ngOnDestroy(): void {
    this.store.dispatch(new ClearStudio());
  }
}
