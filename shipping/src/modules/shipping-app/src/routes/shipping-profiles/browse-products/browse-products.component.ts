import { HttpClient } from '@angular/common/http';
import {
  ChangeDetectorRef,
  Component,
  HostListener,
  Inject,
  OnDestroy,
  OnInit,
  ViewChild,
  ViewEncapsulation,
} from '@angular/core';
import { MatIconRegistry } from '@angular/material/icon';
import { MatMenuTrigger } from '@angular/material/menu';
import { DomSanitizer } from '@angular/platform-browser';
import {
  EnvironmentConfigInterface,
  EnvService,
  PeDataGridFilterItem,
  PeDataGridLayoutType,
  PE_ENV,
  AppThemeEnum,
  PeDataGridSingleSelectedAction,
} from '@pe/common';
import { PeDataGridComponent, PeDataGridSidebarService } from '@pe/data-grid';
import { TranslateService } from '@pe/i18n';
import { MediaService } from '@pe/media';
import { PE_OVERLAY_DATA, PeOverlayRef } from '@pe/overlay-widget';
import { BehaviorSubject, merge, Observable } from 'rxjs';
import { debounceTime, distinctUntilChanged, map, skip, switchMap, take, takeUntil, tap, withLatestFrom } from 'rxjs/operators';
import { CollectionsLoadedInterface } from '../../../interfaces/products/collection.interface';
import { ProductsResponse } from '../../../interfaces/products/product.interface';
import { AbstractComponent } from '../../../misc/abstract.component';
import { DataGridService } from './services/data-grid.service';
import { ProductsListService } from './services/products-list.service';
import { ProductsApiService } from './services/api.service';

@Component({
  selector: 'peb-browse-products',
  templateUrl: './browse-products.component.html',
  styleUrls: ['./browse-products.component.scss'],
  providers: [DataGridService, ProductsListService, ProductsApiService],
  encapsulation: ViewEncapsulation.None,
})
export class PebBrowseProductsFormComponent extends AbstractComponent implements OnInit, OnDestroy {
  @ViewChild('dataGridComponent') set setDataGrid(dataGrid: PeDataGridComponent) {
    if (dataGrid?.showFilters$) {
      dataGrid.showFilters$.subscribe((value) => {
        if (value !== this.dataGridService.showFilters) {
          this.dataGridService.showFilters = value;
        }
      });
    }
  }
  isMobile = window.innerWidth <= 720;


  addSelectedAction: PeDataGridSingleSelectedAction = {
    label: this.translateService.translate('shipping-app.actions.add'),
    callback: (id: string) => {
      const products = [];
      this.selectedItems.forEach((itemId) => {
        products.push(this.productsListService.products.find(element => element.id === itemId && element.id !== id));
      });
      products.push(this.dataGridService.gridItems.find(element => element.id === id));
      this.peOverlayRef.close(products.length > 0 ? products : null);
    },
  };

  constructor(
    public dataGridService: DataGridService,
    public dataGridSidebarService: PeDataGridSidebarService,
    public productsListService: ProductsListService,
    private cdr: ChangeDetectorRef,
    private mediaService: MediaService,
    private envService: EnvService,
    private httpClient: HttpClient,
    protected translateService: TranslateService,
    @Inject(PE_ENV) public env: EnvironmentConfigInterface,
    @Inject(PE_OVERLAY_DATA) public overlayData: any,
    private peOverlayRef: PeOverlayRef,
    private matIconRegistry: MatIconRegistry,
    private domSanitizer: DomSanitizer,
  ) {
    super(translateService);
    this.matIconRegistry.addSvgIcon(
      `add-collection-product`,
      this.domSanitizer.bypassSecurityTrustResourceUrl('../assets/icons/add-collection-product.svg'),
    );
  }
  viewMode: PeDataGridLayoutType;

  searchItems = [];
  selectedItems = [];

  theme = this.envService.businessData?.themeSettings?.theme
    ? AppThemeEnum[this.envService.businessData?.themeSettings?.theme]
    : AppThemeEnum.default;

  actionAddToCollection: any[] = [];
  // TODO
  private overwriteExistingStream$ = new BehaviorSubject<boolean>(false);

  viewModeSubj$: BehaviorSubject<PeDataGridLayoutType> = new BehaviorSubject<PeDataGridLayoutType>(null);
  viewMode$: Observable<PeDataGridLayoutType> = this.viewModeSubj$.asObservable();

  overwrite = false;
  showCSVTooltip = false;
  showXMLTooltip = false;

  @ViewChild('menuTrigger') menuTrigger: MatMenuTrigger;

  @HostListener('window:resize', ['$event'])
  onResize() {
    this.isMobile = window.innerWidth <= 720;
  }


  ngOnInit(): void {
    this.viewMode = this.viewMode ? this.viewMode : PeDataGridLayoutType.Grid;

    setTimeout(() => {
      this.dataGridService.toggleFiltersDisplaying(!this.isMobile);
    }, 500);

    this.cdr.detectChanges();
    this.loadCollections();
    this.productsListService.loadProducts([]).pipe(take(1)).subscribe();
    this.dataGridService.selectedProducts$.subscribe(
      (value) => {
        this.selectedItems = value;
      },
    );

    this.dataGridService.allFilters$
      .pipe(
        debounceTime(100),
        skip(1),
        switchMap((filters) => {
          this.productsListService.patchPagination({
            page: 1,
          });
          return this.productsListService.loadProducts(filters);
        }),
        takeUntil(this.destroyed$),
      )
      .subscribe();

    this.productsListService.products$
      .pipe(
        tap((products) => {
          const gridItems = [];

          products
            .map((product) => this.dataGridService.createDataGridItem(product))
            .map((item) => {
              const itemTitle = item.title as string;
              const filteredItems = [];

              this.searchItems.forEach((searchItem) => {
                const searchItemText = searchItem.searchText.toLowerCase();

                if (
                  (!searchItem.contains && itemTitle.toLowerCase().includes(searchItemText)) ||
                  (searchItem.contains === 1 && !itemTitle.toLowerCase().includes(searchItemText))
                ) {
                  filteredItems.push(searchItem);
                }
              });

              if (filteredItems.length === this.searchItems.length) {
                gridItems.push(item);
              }
            });

          this.dataGridService.gridItems = gridItems;
          if (this.overlayData?.data) {
            this.selectedItems = this.overlayData?.data.map(item => item.id);
            this.cdr.detectChanges();
          }
        }),
        takeUntil(this.destroyed$),
      )
      .subscribe();

    this.productsListService.collections$
      .pipe(
        tap((collections) => {
          const gridFolders = collections.map((collection) => this.dataGridService.createDataGridFolder(collection));
          this.dataGridService.gridFolders = gridFolders;
        }),
        takeUntil(this.destroyed$),
      )
      .subscribe();

    merge(
      this.productsListService.searchString$.pipe(distinctUntilChanged()).pipe(skip(1)),
      this.productsListService.order$.pipe(
        skip(1),
        distinctUntilChanged((order1, order2) => order1.by === order2.by && order1.direction === order2.direction),
      ),
    )
      .pipe(
        withLatestFrom(this.dataGridService.allFilters$),
        switchMap(([_, filters]) => this.productsListService.loadProducts(filters)),
        takeUntil(this.destroyed$),
      )
      .subscribe();

    this.productsListService.pagination$
      .pipe(
        skip(2),
        map((pagination) => pagination.page),
        distinctUntilChanged(),
      )
      .pipe(
        withLatestFrom(this.dataGridService.allFilters$),
        switchMap(([page, filters]) => this.productsListService.loadProducts(filters, page !== 1)),
        takeUntil(this.destroyed$),
      )
      .subscribe();
  }

  onMenuClosed() {
    this.showCSVTooltip = false;
    this.showXMLTooltip = false;
    this.overwrite = false;
  }

  onSelectedItemsChanged(ids: string[]): void {
    this.dataGridService.selectedProducts = ids;
  }

  scrollOnBottom(event: any): void {
    if (this.productsListService.hasNextPage) {
      const pos = (event.target.scrollTop as number) + (event.target.clientHeight as number);
      const max = event.target.scrollHeight;
      if (pos >= max) {
        this.productsListService.loadNextPage();
      }
    }
  }

  onLayoutChanged(layout: PeDataGridLayoutType) {
    this.viewModeSubj$.next(layout);
  }

  onFiltersChanged(filterItems: PeDataGridFilterItem[]) {
    // IF FILTER ITEMS IS NULL RESET BUTTON WAS CLICKED
    if (filterItems === null && this.dataGridService.conditionFormattedFilters.length) {
      this.resetProducts().pipe(take(1)).subscribe();
    }
  }

  onSearchChanged(e) {
    this.searchItems = [...this.searchItems, e];
    this.productsListService.searchString = this.productsListService.searchString === '' ? null : '';
  }

  onSearchRemove(e) {
    this.searchItems.splice(e, 1);
    this.productsListService.searchString = this.productsListService.searchString === '' ? null : '';
  }

  toggleFiltersDisplaying(value?: boolean) {
    this.dataGridService.toggleFiltersDisplaying(true);
    this.dataGridService.toggleFiltersDisplaying(false);
    this.cdr.detectChanges();
  }

  ngOnDestroy() {
    super.ngOnDestroy();
    this.dataGridService.loadingProductId = null;
  }

  private loadCollections(): void {
    this.productsListService
      .loadCollections()
      .pipe(
        tap((data: CollectionsLoadedInterface) => {
          const actions = data.collections.map((collection) => ({
            label: collection.name,
            callback: (selectedIds: string[]) => {
              this.addSelectedToCollection(selectedIds, collection._id);
            },
          }));
          this.dataGridService.actionAddToCollection.push(...actions);
          this.cdr.detectChanges();
        }),
        take(1),
      )
      .subscribe();
  }

  private resetProducts(): Observable<ProductsResponse> {
    this.dataGridService.conditionFormattedFilters = [];
    this.dataGridService.filtersFormGroup.get('tree').patchValue([]);
    return this.productsListService.resetProducts();
  }

  private addSelectedToCollection(selectedIds: string[], collectionId: string) {
    this.productsListService
      .addProductsToCollection(collectionId, selectedIds)
      .pipe(
        take(1),
        switchMap(() => {
          this.dataGridService.selectedProducts = [];
          return this.productsListService.resetProducts();
        }),
      )
      .subscribe();
  }

  onSelectedChanged(e) {
    this.selectedItems = e;
  }

  closeProductDialog() {
    this.peOverlayRef.close(null);
  }

  addProductDialog() {
    const products = [];
    this.selectedItems.forEach((itemId) => {
      products.push(this.productsListService.products.find(element => element.id === itemId));
    });
    this.peOverlayRef.close(products.length > 0 ? products : null);
  }

}
