import { Overlay, OverlayRef } from '@angular/cdk/overlay';
import { TemplatePortal } from '@angular/cdk/portal';
import { HttpErrorResponse, HttpEvent, HttpEventType } from '@angular/common/http';
import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  ElementRef,
  HostListener,
  OnInit,
  ViewChild,
  ViewContainerRef,
} from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import {
  AppThemeEnum, PeDataGridButtonAppearance,
  PeDataGridFilterItem, PeDataGridFilterItems, PeDataGridMultipleSelectedAction,
  PeDataGridSingleSelectedAction, PeDataGridSortByAction, PeDataGridSortByActionIcon,
} from '@pe/common';
import { PeDataGridComponent } from '@pe/data-grid';
import { TranslateService } from '@pe/i18n-core';
import { BlobCreateResponse, MediaService } from '@pe/media';
import { PeDataGridSidebarService } from '@pe/sidebar';
import { BehaviorSubject, Observable, of, timer } from 'rxjs';
import { takeUntil, tap } from 'rxjs/internal/operators';
import { delay } from 'rxjs/operators';
import { AbstractComponent } from '../../components/abstract';
import { folderQueryParam, positionQueryParam } from '../../components/employees/constants';
import { OVERLAY_POSITIONS } from '../../misc/constants/position';
import { SizesEnum, WallpaperViewEnum } from '../../misc/enum';
import {
  BusinessEnvService,
  PebWallpapersService,
  PebWallpaperStorageService,
  WallpaperDataInterface,
  WallpaperGridItemConverterService,
} from '../../services';
import { BackgroundService } from '../../services/background.service';
import { PebWallpaperSidebarService } from '../../services/wallpaper-sidebar.service';

const offsetLimit = 10;
const page = 1;

@Component({
  selector: 'peb-wallpapers',
  templateUrl: './wallpapers.component.html',
  styleUrls: ['./wallpapers.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class WallpapersComponent extends AbstractComponent implements OnInit {
  @ViewChild('fileSelector') fileSelector: ElementRef;
  @ViewChild('dataGridComponent') set setDataGrid(dataGrid: PeDataGridComponent) {
    if (dataGrid?.showFilters$) {
      dataGrid.showFilters$.subscribe(value => {
        if (value !== this.showSidebarStream$.value) {
          this.showSidebarStream$.next(value);
        }
      });
    }
  }
  @ViewChild('wallpaperDatagrid') wallpaperDatagrid: PeDataGridComponent;
  page = page;
  limit = offsetLimit;
  activeView = WallpaperViewEnum.gallery;
  private showSidebarStream$ = new BehaviorSubject<boolean>(true);
  showSidebar$ = this.showSidebarStream$.asObservable().pipe(delay(0));
  theme = this.envService.businessData$?.themeSettings?.theme
    ? AppThemeEnum[this.envService.businessData$?.themeSettings?.theme]
    : AppThemeEnum.default;
  items: any[];
  originItems: any[];
  dataGridMyWallpapersItems: any[];
  myWallpapers: any[];
  myWallpaperObject: any;
  galleryWallpapers: any[];
  selectedItems$: Observable<string[]> = of([]);
  activeWallpaper: WallpaperDataInterface = null;
  sidebarCategories: any[] = [];
  refresh$: Observable<void> = of(null);
  searchItems = [];
  dataGridFilters: PeDataGridFilterItem[];
  searchString: string;
  uploadingInProgress: boolean = false;
  uploadingImage: any;
  isMobile = window.innerWidth <= 720;
  uploadProgress: number = 0;
  maxFileSize = SizesEnum.MAX_FILE_SIZE;
  allowAddWallpaper = false;
  currentNavParams: any;
  sorted = true;
  selectable = false;
  contextActions = [];
  contextRef: OverlayRef;
  contextMenuClickedItem: any;

  set showSidebar(value: boolean) {
    this.showSidebarStream$.next(value);
  }

  addItemAction: PeDataGridSingleSelectedAction = {
    label: 'Add New Wallpaper',
    callback: (data: string) => {
      this.fileSelector.nativeElement.click();
    },
  };

  addNewItem = {
    title: 'Add new',
    actions: [this.addItemAction],
  };
  leftPaneButton: any;
  isFilterCreating: boolean;

  wallpaperSidebarTreeControl = this.fb.control([]);

  gridOptions = {
    nameTitle: this.translateService.translate('info_boxes.panels.wallpaper.data_grid.name'),
    customFieldsTitles: [this.translateService.translate('info_boxes.panels.wallpaper.data_grid.industry')],
  };

  filterSettings: PeDataGridFilterItems[] = [
    {
      value: this.gridOptions.nameTitle,
      label: this.gridOptions.nameTitle,
    },
    {
      value: this.gridOptions.customFieldsTitles[0],
      label: this.gridOptions.customFieldsTitles[0],
    },
  ];

  sortByActions: PeDataGridSortByAction[] = [
    {
      label: this.translateService.translate('info_boxes.panels.wallpaper.data_grid.name'),
      callback: () => {
        this.sorted = !this.sorted;
        this.items.sort((a, b) => {
          const nameA = a.id?.name.toUpperCase();
          const nameB = b.id?.name.toUpperCase();
          if (nameA < nameB) {
            return this.sorted ? 1 : -1;
          }
          if (nameA > nameB) {
            return this.sorted ? -1 : 1;
          }

          return 0;
        });
      },
      icon: PeDataGridSortByActionIcon.Name,
    },
  ];

  singleSelectedAction = {
    label: this.translateService.translate('info_boxes.panels.wallpaper.single_selected_action.set'),
    callback: (wallpaper: any) =>  {
      this.onImageSelect(wallpaper);
    },
  };

  multipleSelectedActions: PeDataGridMultipleSelectedAction[] = [
    {
      label: this.translateService.translate('info_boxes.panels.wallpaper.data_grid.multiple_actions.choose'),
      appearance: PeDataGridButtonAppearance.Link,
      actions: [
        {
          label: this.translateService.translate('info_boxes.panels.wallpaper.data_grid.multiple_actions.delete'),
          callback: (wallpapers) => {
            const promises = [];
            wallpapers.forEach((wallpaper) => {
              promises.push(this.wallpaperService.deleteWallpaper(wallpaper));
            });
            Promise.all(
              promises,
            ).then(res => {
              this.items = [];
              this.originItems = [];
              this.loadWallpaper();
            });
          },
        },
      ],
    },
  ];

  @HostListener('window:resize', ['$event'])
  onResize() {
    this.isMobile = window.innerWidth <= 720;
  }

  constructor(
    private fb: FormBuilder,
    private dataGridSidebarService: PeDataGridSidebarService,
    private wallpaperService: PebWallpapersService,
    private converterService: WallpaperGridItemConverterService,
    private mediaService: MediaService,
    private cdr: ChangeDetectorRef,
    private sidebarService: PebWallpaperSidebarService,
    private activatedRoute: ActivatedRoute,
    private backgroundService: BackgroundService,
    private router: Router,
    private translateService: TranslateService,
    private envService: BusinessEnvService,
    private wallpaperStorage: PebWallpaperStorageService,
    protected overlay: Overlay,
    protected viewContainerRef: ViewContainerRef,
  ) {
    super();
  }

  ngOnInit(): void {
    if (window.innerWidth > 1000 && window.innerWidth < 2000) {
      this.limit = 15;
    } else if (window.innerWidth > 2000) {
      this.limit = 25;
    }
    this.loadWallpaper();
    this.fillContextMenu();

    this.converterService.refreshData$.pipe(takeUntil(this.destroyed$))
      .subscribe(
      res => {
        this.onImageSelect(res.wallpaper);
      },
    );

    this.handleSidebarChanges();
    this.dataGridSidebarService.toggleFilters$.next();
    this.activeView = this.activatedRoute.snapshot.params['activeView'] || WallpaperViewEnum.gallery;
  }

  onFilterCreate($event: string) {

  }

  onWallpaperPositionSelect(node: any[]) {
    const nodeData = node[0];
    if (!nodeData) {
      this.router.navigate([]);

      return;
    }

    const queryParams = {};
    if (nodeData.hasOwnProperty('children')) {
      queryParams[folderQueryParam] = nodeData.category;
    } else {
      queryParams[positionQueryParam] = nodeData.category;
      queryParams[folderQueryParam] = nodeData.folder;
    }
    this.router.navigate([], {queryParams});
  }

  loadWallpaper() {
    this.wallpaperService.loadWallpapersTree().subscribe(tree => {
      this.setSidebarFilters(tree);
      this.wallpaperService.loadWallpapers(this.page, this.limit).subscribe(([galleryWallpapers, ownWallpaper]) => {
        this.activeView = this.activatedRoute.snapshot.params['activeView'] || WallpaperViewEnum.gallery;
        this.myWallpaperObject = ownWallpaper;
        if (this.myWallpaperObject?.myWallpapers) {
          this.myWallpapers = this.myWallpaperObject.myWallpapers || [];
          this.myWallpaperObject.myWallpapers.forEach((wallpaper) => {
            wallpaper.industry = 'OWN';
          });
        } else {
          this.myWallpapers = [];
        }

        const cw = this.myWallpaperObject;
        this.activeWallpaper = cw && cw.currentWallpaper ? cw.currentWallpaper : this.wallpaperStorage.defaultWallpaper;
        this.galleryWallpapers = galleryWallpapers;
        this.originItems = this.converterService.getFilteredWallpapers(galleryWallpapers, this.activeWallpaper);
        this.items = this.originItems;
        this.activatedRoute.queryParams.pipe(
          takeUntil(this.destroyed$),
        ).subscribe(params => {
          this.setDataGridItems(params);
        });
        this.cdr.detectChanges();
      });
    });
  }

  private handleSidebarChanges() {
    this.wallpaperSidebarTreeControl.valueChanges
      .pipe(takeUntil(this.destroyed$))
      .subscribe( res => {
        this.onWallpaperPositionSelect(res);
      });
  }

  onToggle(view: WallpaperViewEnum) {
    this.activeView = view;
    this.router.navigate(['.', { activeView: view }], { relativeTo: this.activatedRoute });
  }

  onFiltersChanged(filters: PeDataGridFilterItem[]): void {
    if (this.activeView === WallpaperViewEnum.myWallpapers) {
      this.onToggle(WallpaperViewEnum.gallery);
    }
    this.dataGridFilters = filters;
    this.items = this.originItems;
    this.cdr.markForCheck();
  }

  onSearchRemove(event) {
    this.searchItems.splice(event, 1);
    this.searchString = '';
    this.dataGridFilters = null;
    if ( this.currentNavParams?.folder === WallpaperViewEnum.myWallpapers) {
      this.setDataGridItems(this.currentNavParams);
      this.items = this.converterService.filterDataGrid(this.searchItems, this.items);
    } else {
      this.searchHandle();
    }
  }

  onSearchChanged(event) {
    if (!event?.filter) {
      event['filter'] = 'Name';
    }
    this.searchItems = [...this.searchItems, event];
    this.searchString = event.searchText;
    this.dataGridFilters = null;
    if ( this.currentNavParams?.folder === WallpaperViewEnum.myWallpapers) {
      this.items = this.converterService.filterDataGrid(this.searchItems, this.items);
    } else {
      this.searchHandle();
    }
  }

  private setSidebarFilters(treeData): void {
    const galleryTree = this.sidebarService.getTreeData(treeData);
    const myWallpapersTree = this.sidebarService.getMyWallpaperTree();

    this.sidebarCategories = [myWallpapersTree, galleryTree];
    this.cdr.markForCheck();
  }

  onImageSelect(wallpaper) {
    this.wallpaperService.setWallpaper(wallpaper).subscribe(
      res => {
        this.activeWallpaper = wallpaper;
        this.items = [];
        this.originItems = this.converterService
          .getFilteredWallpapers(this.galleryWallpapers, this.activeWallpaper);
        this.setDataGridItems(this.currentNavParams);
      },
    );
  }

  onSidebarItemClick(e) {
    let queryParams = {};
    if (e === WallpaperViewEnum.myWallpapers) {
      queryParams[folderQueryParam] = WallpaperViewEnum.myWallpapers;
    } else {
      queryParams = {};
    }

    this.router.navigate([], {queryParams});
  }

  uploadImage(event: Event): void {
    const fileInput: HTMLInputElement = event.target as HTMLInputElement;
    const file: File = fileInput.files[0];

    if ( !file.type.startsWith(`image/`) ) {
      this.fileSelector.nativeElement.value = null;

      return;
    }

    if ( !this.isFileSizeValid(file) ) {
      this.fileSelector.nativeElement.value = null;

      return;
    }

    this.uploadProgress = 0;
    this.uploadingInProgress = true;
    const reader: FileReader = new FileReader();
    reader.onload = (onLoadEvent: any) => {
      this.uploadingImage = onLoadEvent.target.result;
    };
    reader.readAsDataURL(file);
    let sub = timer().subscribe();
    this.wallpaperService.postImageBlob(file).subscribe(
      (blobCreateResponseHttpEvent: HttpEvent<BlobCreateResponse>) => {
        switch (blobCreateResponseHttpEvent.type) {
          case HttpEventType.UploadProgress: {
            // We have to show real uploading only first 50%, because when file is uploaded
            // - server doesn't finish request during 10-30 seconds.
            // So we have to fake progress during next 50%.
            this.uploadProgress = Number(((blobCreateResponseHttpEvent.loaded * 99) / blobCreateResponseHttpEvent.total).toFixed(0));
            this.uploadProgress = this.uploadProgress / 2;
            if (blobCreateResponseHttpEvent.loaded === blobCreateResponseHttpEvent.total) {
              let counter = 48;
              sub = timer(100, 500).subscribe(() => {
                this.uploadProgress = this.uploadProgress + (99 - this.uploadProgress) / Math.max(24, counter--);
                this.cdr.detectChanges();
              });
            }
            break;
          }

          case HttpEventType.Response: {
            if (!blobCreateResponseHttpEvent.body || !blobCreateResponseHttpEvent.body.blobName) {
              this.uploadingInProgress = false;
              this.uploadingImage = null;
              break;
            }
            sub.unsubscribe();
            this.uploadProgress = 100;
            setTimeout(
              () => {
                const body = blobCreateResponseHttpEvent.body;
                const w = this.wallpaperService.onWallpaperUploaded(body.blobName, body.brightnessGradation);
                this.myWallpapers.unshift(w);
                this.myWallpapers.forEach((wallpaper) => {
                  wallpaper.industry = 'OWN';
                });
                this.dataGridMyWallpapersItems = this.converterService.getDataGridItems(this.myWallpapers, this.activeWallpaper);
                this.cdr.markForCheck();
                this.uploadingInProgress = false;
                this.uploadingImage = null;
                this.fileSelector.nativeElement.value = '';
                this.items = this.dataGridMyWallpapersItems;
              },
              1000,
            );
            break;
          }

          default: break;
        }
      },
      (error: HttpErrorResponse) => {
        this.uploadingInProgress = false;
        this.uploadingImage = null;
      },
    );
  }

  private isFileSizeValid(file: File): boolean {
    return file.size <= this.maxFileSize;
  }

  setDataGridItems(params) {
    const position = params[positionQueryParam];
    const folder = params[folderQueryParam];
    this.allowAddWallpaper = false;
    this.currentNavParams = {};
    this.page = page;
    this.limit = offsetLimit;
    this.selectable = false;
    if (folder && !position && folder !== WallpaperViewEnum.myWallpapers) {
      this.currentNavParams[folderQueryParam] = folder;
      this.currentNavParams['id'] = this.sidebarCategories[1].tree.find(tree => tree.category === folder).id;
      this.wallpaperService.loadWallpaperByCode(this.currentNavParams.id, this.page, this.limit).pipe(takeUntil(this.destroyed$)).subscribe(
        (result: WallpaperDataInterface[]) => {
          this.items = this.converterService.getFilteredWallpapers(result, this.activeWallpaper);
          this.cdr.detectChanges();
        });
    } else if (position) {
      this.currentNavParams[positionQueryParam] = position;
      this.currentNavParams[folderQueryParam] = folder;
      this.currentNavParams['id'] = this.sidebarCategories[1].tree.find(tree => tree.category === folder)
        .children.find(child => child.category === position).id;
      this.wallpaperService.loadWallpaperByCode(this.currentNavParams.id, this.page, this.limit).pipe(takeUntil(this.destroyed$)).subscribe(
        (result: WallpaperDataInterface[]) => {
          this.items = this.converterService.getFilteredWallpapers(result, this.activeWallpaper);
          this.cdr.detectChanges();
        });
    } else {
      if (folder === WallpaperViewEnum.myWallpapers) {
        this.selectable = true;
        this.currentNavParams[folderQueryParam] = folder;
        this.allowAddWallpaper = true;
        this.items = this.converterService.getDataGridItems(this.myWallpapers, this.activeWallpaper);
      } else {
        this.items = this.originItems;
      }
    }
    this.cdr.detectChanges();
  }

  openContextMenu(event: any, item, context) {
    if (event && this.selectable) {
      event.preventDefault();
      event.stopPropagation();

      this.contextMenuClickedItem = item || null;
      this.contextRef = this.overlay.create({
        positionStrategy: this.overlay
          .position()
          .flexibleConnectedTo(event)
          .withFlexibleDimensions(false)
          .withViewportMargin(10)
          .withPositions(OVERLAY_POSITIONS),
        scrollStrategy: this.overlay.scrollStrategies.reposition(),
        hasBackdrop: true,
        backdropClass: 'connect-context-menu-backdrop',
      });

      this.contextRef.backdropClick().pipe(
        tap(() => this.closeContextMenu()),
      ).subscribe();

      this.contextRef.attach(new TemplatePortal(context, this.viewContainerRef));
    } else {
      event.preventDefault();
      event.stopPropagation();
    }
  }

  fillContextMenu() {
    this.contextActions = [
      {
        label: 'Delete',
        callback: this.onDeleteItem,
      },
    ];
  }

  onDeleteItem = (event) => {
    Promise.all(
      [this.wallpaperService.deleteWallpaper(this.contextMenuClickedItem.id)],
    ).then(res => {
      this.items = [];
      this.originItems = [];
      this.loadWallpaper();
    });
    this.closeContextMenu();
  }

  closeContextMenu() {
    if (this.contextRef) {
      this.contextRef.dispose();
    }
  }

  toggleSidebar() {
    this.showSidebarStream$.next(!this.showSidebarStream$.value);
  }

  scrollBottom(e) {
    if (this.searchItems?.length > 0 && this.currentNavParams?.folder !== WallpaperViewEnum.myWallpapers) {
      this.page += 1;
      this.wallpaperService.searchWallpaper(this.searchItems, this.currentNavParams?.id, this.page, this.limit).subscribe(
        (wallpapers: WallpaperDataInterface[]) => {
          this.setNewLoadItems(wallpapers);
        });
    } else {
      if (!this.currentNavParams.folder) {
        if (this.items?.length) {
          this.page += 1;
          this.wallpaperService.loadAllWallpapers(this.page, this.limit).pipe(
            tap((wallpapers) => {
              this.setNewLoadItems(wallpapers);
            }),
          ).subscribe();
        }
      } else if (this.currentNavParams.id) {
        if (this.items?.length) {
          this.page += 1;
          this.wallpaperService.loadWallpaperByCode(this.currentNavParams?.id, this.page, this.limit).pipe(
            tap((wallpapers) => {
              this.setNewLoadItems(wallpapers);
            }),
          ).subscribe();
        }
      }
    }
  }

  setNewLoadItems(items) {
    this.items = [
      ...this.items,
      ...this.converterService.getFilteredWallpapers(items, this.activeWallpaper)
    ];
    this.cdr.markForCheck();
  }

  searchHandle() {
    this.page = page;
    const navId = this.currentNavParams?.id || null;
    this.wallpaperService.searchWallpaper(this.searchItems, navId, this.page, this.limit)
      .subscribe((result: WallpaperDataInterface[]) => {
        this.items = this.converterService.getFilteredWallpapers(result, this.activeWallpaper);
        this.cdr.markForCheck();
      });
  }
}
