import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  ElementRef,
  HostListener,
  OnDestroy,
  OnInit,
  ViewChild,
} from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ApmService } from '@elastic/apm-rum-angular';
import { Select, Store } from '@ngxs/store';
import { BehaviorSubject, forkJoin, Observable, of } from 'rxjs';
import { catchError, filter, map, switchMap, take, takeUntil, tap } from 'rxjs/operators';

import {
  EnvService,
  MessageBus,
  PeDataGridPaginator,
  PeDataGridSortByActionIcon,
  PeDestroyService,
} from '@pe/common';
import { ConfirmScreenService, Headings } from "@pe/confirmation-screen";
import { SnackBarService } from '@pe/forms-core';
import {
  GridSkeletonColumnType,
  PeDataGridLayoutByActionIcon,
  PeDataToolbarOptionIcon,
  PeGridItem,
  PeGridItemContextSelect,
  PeGridMenu,
  PeGridService,
  PeGridTableActionCellComponent,
  PeGridTableDisplayedColumns,
  PeGridTableTitleCellComponent,
  PeGridView,
  PeGridViewportContextSelect,
} from '@pe/grid';
import { PeFilterConditions, PeFilterType } from '@pe/grid/shared';
import { LocaleConstantsService, TranslateService } from '@pe/i18n';
import { PeOverlayConfig, PeOverlayRef, PeOverlayWidgetService } from '@pe/overlay-widget';

import { ContextMenu, OptionsMenu } from '../../enums/grid-enums';
import { ShippingSettingInterface } from '../../interfaces';
import { BaseComponent } from '../../misc/base.component';
import { PebShippingBusinessService } from '../../services/business-shipping.service';
import { PebShippingSettingsService } from '../../services/shipping-settings.service';
import { PebShippingZoneService } from '../../services/shipping-zone.service';
import { filterDataGrid, sortItems } from '../../shared';
import { ClearStore, OpenZonesFolder } from '../../store/shipping.action';
import { ShippingAppState } from '../../store/shipping.state';
import { PebShippingConnectService } from '../connect/connect.service';

import { PebShippingEditOptionsComponent } from './edit-options-modal/edit-options.component';

@Component({
  selector: 'peb-shipping-options',
  templateUrl: './shipping-options.component.html',
  styleUrls: ['./shipping-options.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [
    PeDestroyService,
  ],
})
export class PebShippingOptionsComponent extends BaseComponent implements OnInit, OnDestroy {
  @ViewChild('canvas', { static: false }) canvas: ElementRef;
  @Select(ShippingAppState.zonesGridItems) gridItems$: Observable<PeGridItem[]>;

  isMobile = window.innerWidth <= 720;
  gridLayout$ = new BehaviorSubject<string>(PeGridView.List);

  viewportTitle = this.translateService.translate('shipping-app.main_nav.zones');

  dialogRef: PeOverlayRef;

  categories = [];
  connections = [];
  isAllSelectable = false;
  countries = [];
  currency;

  onSaveSubject$ = new BehaviorSubject<any>(null);
  readonly onSave$ = this.onSaveSubject$.asObservable();

  totalItems$ = new BehaviorSubject<number>(0);
  isLoading$: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);

  paginator: PeDataGridPaginator = {
    page: 0,
    perPage: 40,
    total: 10,
  };

  order = 'desc';

  toolbar = {
    filterConfig: [{
      fieldName: 'title',
      filterConditions: [
        PeFilterConditions.Contains,
        PeFilterConditions.DoesNotContain,
      ],
      label: this.translateService.translate('shipping-app.grid_fields.name'),
      type: PeFilterType.String,
    }],
    optionsMenu: {
      title: this.translateService.translate('shipping-app.grid.options'),
      items: [
        {
          label: this.translateService.translate('shipping-app.grid.select_all'),
          value: OptionsMenu.SelectAll,
          defaultIcon: PeDataToolbarOptionIcon.SelectAll,
        },
        {
          label: this.translateService.translate('shipping-app.grid.deselect_all'),
          value: OptionsMenu.DeselectAll,
          defaultIcon: PeDataToolbarOptionIcon.DeselectAll,
        },
        {
          label: this.translateService.translate('shipping-app.grid.delete'),
          value: OptionsMenu.Delete,
          defaultIcon: PeDataToolbarOptionIcon.Delete,
        },
      ],
    },
    sortMenu: {
      title: this.translateService.translate('shipping-app.sort_actions.title'),
      items: [
        {
          label: this.translateService.translate('grid.toolbar.sort_menu.a_z'),
          value: 'asc',
          defaultIcon: PeDataGridSortByActionIcon.Ascending,
          active: true,
        },
        {
          label: this.translateService.translate('grid.toolbar.sort_menu.z_a'),
          value: 'desc',
          defaultIcon: PeDataGridSortByActionIcon.Descending,
        },
        {
          label: this.translateService.translate('grid.toolbar.sort_menu.newest'),
          value: 'desc,createdAt',
          defaultIcon: PeDataGridSortByActionIcon.Ascending,
        },
        {
          label: this.translateService.translate('grid.toolbar.sort_menu.oldest'),
          value: 'asc,createdAt',
          defaultIcon: PeDataGridSortByActionIcon.Descending,
        },
      ],
    },
  };

  displayedColumns: PeGridTableDisplayedColumns[] = [
    {
      name: 'name',
      title: this.translateService.translate('shipping-app.grid_fields.name'),
      cellComponent: PeGridTableTitleCellComponent,
      skeletonColumnType: GridSkeletonColumnType.ThumbnailWithName,
    },
    {
      name: 'price',
      title: this.translateService.translate('shipping-app.grid_fields.price'),
    },
    {
      name: 'action',
      title: '',
      cellComponent: PeGridTableActionCellComponent,
      skeletonColumnType: GridSkeletonColumnType.Rectangle,
    },
  ];

  viewportContextMenu: PeGridMenu = {
    title: this.translateService.translate('shipping-app.grid.options'),
    items: [{
      label: this.translateService.translate('shipping-app.grid.paste'),
      value: ContextMenu.Paste,
      disabled: true,
    }],
  };

  itemContextMenu: PeGridMenu = {
    title: this.translateService.translate('shipping-app.grid.options'),
    items: [
      {
        label: this.translateService.translate('shipping-app.grid.copy'),
        value: ContextMenu.Copy,
      },
      {
        label: this.translateService.translate('shipping-app.grid.paste'),
        value: ContextMenu.Paste,
        disabled: true,
      },
      {
        label: this.translateService.translate('shipping-app.grid.delete'),
        value: ContextMenu.Delete,
      }],
  };

  viewMenu: PeGridMenu = {
    title: this.translateService.translate('grid.content.toolbar.layout'),
    items: [
      {
        label: this.translateService.translate('grid.content.toolbar.list'),
        value: PeGridView.Table,
        defaultIcon: PeDataGridLayoutByActionIcon.ListLayout,
      },
      {
        label: this.translateService.translate('grid.content.toolbar.grid'),
        value: PeGridView.List,
        defaultIcon: PeDataGridLayoutByActionIcon.GridLayout,
        minItemWidth: 290,
        maxColumns: 5,
      },
    ],
  };

  viewportContextMenu$ = new BehaviorSubject<PeGridMenu>(this.viewportContextMenu);
  itemContextMenu$ = new BehaviorSubject<PeGridMenu>(this.itemContextMenu);

  items: PeGridItem[] = [];
  originItems = [];

  constructor(
    private overlayService: PeOverlayWidgetService,
    private cdr: ChangeDetectorRef,
    private shippingConnectService: PebShippingConnectService,
    private shippingSettingsService: PebShippingSettingsService,
    private shippingZoneService: PebShippingZoneService,
    private shippingBusinessService: PebShippingBusinessService,
    private envService: EnvService,
    protected translateService: TranslateService,
    private confirmScreenService: ConfirmScreenService,
    private localConstantsService: LocaleConstantsService,
    private gridService: PeGridService,
    private store: Store,
    private snackBarService: SnackBarService,
    private destroy$: PeDestroyService,
    private apmService: ApmService,
    private messageBus: MessageBus,
    private route: ActivatedRoute,
  ) {
    super(translateService);
  }

  onBranchCreate(name, category) {
    category.title = name;
  }

  ngOnInit() {
    const currentLayout = localStorage.getItem('shipping.zones.grid.layout');
    if (currentLayout) {
      this.gridLayout$.next(currentLayout);
    }
    this.getCountries();
    this.getSettings();
    this.connections = this.getConnections();
    if (this.route.snapshot.params.zoneId) {
      const zone = this.route.snapshot.data.zone;
      this.openProfileDialog(zone);
    }
  }

  @HostListener('window:resize', ['$event'])
  onResize() {
    this.isMobile = window.innerWidth <= 720;
  }

  onSearchChanged(searchItems) {
    this.getZones(searchItems);
  }

  getConnections() {
    const connections = [];
    this.shippingConnectService
      .getShippingMethods()
      .pipe(
        map((data: any) => {
          return data.integrationSubscriptions;
        }),
        catchError((err) => {
          this.snackBarService.show(
            `Cant load connect from server, reason: ${err?.message}`,
          );

          return of(null);
        }),
        takeUntil(this.destroy$),
      )
      .subscribe((response: any) => {
        response.forEach((element) => {
          if (element.enabled) {
            connections.push(element.integration);
          }
        });
      });

    return connections;
  }

  getSettings() {
    this.shippingBusinessService.getShippingSettings().pipe(takeUntil(this.destroy$))
      .subscribe((response: ShippingSettingInterface) => {
        this.currency = response.currency;
        this.cdr.detectChanges();
        this.getZones();
      });
  }

  getZones(searchConfig = null) {
    this.isLoading$.next(true);
    this.shippingSettingsService.getSettings(this.envService.businessId)
      .pipe(
        tap((response: any) => {
          if (response[0]?.zones?.length) {
            this.originItems = response[0]?.zones;
            if (this.order) {
              this.originItems = sortItems(this.order, this.originItems);
            }
            this.items = this.originItems
              .map(item =>
                this.shippingSettingsService.zoneToItemMapper(item, this.canvas, this.getCountryName, this.currency));
            if (searchConfig?.length) {
              this.items = filterDataGrid(searchConfig, this.items);
            }
          } else {
            this.gridService.items$.next([]);
          }
          this.totalItems$.next(this.items.length);
          this.isLoading$.next(false);
          this.store.dispatch(new OpenZonesFolder(this.items));
          this.cdr.detectChanges();
        }),
        takeUntil(this.destroy$),
      ).subscribe();
  }

  showConfirmationWindow(dialogContent) {
    const headings: Headings = {
      declineBtnText: this.translateService.translate('shipping-app.actions.no'),
      confirmBtnText: this.translateService.translate('shipping-app.actions.yes'),
      ...dialogContent,
    };
    const confirmDialog = this.confirmScreenService.show(headings, true);

    confirmDialog.pipe(
      take(1),
      tap(() => {
        this.dialogRef.close();
      }),
    ).subscribe();
  }

  showDeleteConfirmation(dialogContent, ids = null) {
    const headings: Headings = {
      declineBtnText: this.translateService.translate('shipping-app.actions.no'),
      confirmBtnText: this.translateService.translate('shipping-app.actions.yes'),
      ...dialogContent,
    };
    const confirmDialog = this.confirmScreenService.show(headings, true);

    confirmDialog.pipe(
      take(1),
      switchMap(() => {
        return forkJoin(ids.map(id => this.shippingZoneService
          .deleteShippingZone(id)
          .pipe(
            tap((_) => {
              this.getZones();
              this.cdr.detectChanges();
            }),
            catchError((err) => {
              this.apmService.apm.captureError(
                `Cant delete zone ERROR ms:\n ${JSON.stringify(err)}`,
              );

              return of(true);
            }),
          ),
        ));
      }),
    ).subscribe();

  }

  onContentDelete({ themeIds }): void {
    this.showDeleteConfirmation(themeIds);
  }


  getCountries() {
    const countryList = this.localConstantsService.getCountryList();

    this.countries = [];

    this.countries.push({
      value: 'All',
      label: 'All Countries',
    });

    Object.keys(countryList).map((countryKey) => {
      this.countries.push({
        value: countryKey,
        label: Array.isArray(countryList[countryKey]) ? countryList[countryKey][0] : countryList[countryKey],
      });
    });
  }

  optionsChange(event: string): void {
    this.isAllSelectable = false;
    switch (event) {
      case OptionsMenu.SelectAll:
        this.gridService.selectedItems = this.items;
        this.isAllSelectable = true;
        this.cdr.detectChanges();
        break;
      case OptionsMenu.DeselectAll:
        this.unselectAllItems();
        break;
      case OptionsMenu.Delete:
        this.onDeleteItem(this.gridService.selectedItemsIds);
        this.unselectAllItems();
        break;
    }
  }

  unselectAllItems() {
    this.gridService.selectedItems = [];
    this.cdr.detectChanges();
  }

  sortChange(sort: string): void {
    this.order = sort;
    this.paginator.page = 0;
    this.getSettings();
  }

  viewChange(layout): void {
    localStorage.setItem('shipping.zones.grid.layout', layout);
    this.cdr.detectChanges();
  }

  createByHand() {
    const config: PeOverlayConfig = {
      data: { connections: this.connections, currency: this.currency, items: this.originItems },
      headerConfig: {
        title: this.translateService.translate('shipping-app.modal_header.title.new_zone'),
        backBtnTitle: this.translateService.translate('shipping-app.actions.cancel'),
        backBtnCallback: () => {
          this.showConfirmationWindow(this.getConfirmationContent('zone', 'adding'));
        },
        doneBtnTitle: this.translateService.translate('shipping-app.actions.done'),
        doneBtnCallback: () => {
          this.onSaveSubject$.next(this.dialogRef);
        },
        onSaveSubject$: this.onSaveSubject$,
        onSave$: this.onSave$,
      },
      backdropClick: () => {
        this.showConfirmationWindow(this.getConfirmationContent('zone', 'adding'));
      },
      component: PebShippingEditOptionsComponent,
      panelClass: 'shipping-zones-dialog',
    };
    this.dialogRef = this.overlayService.open(config);
    this.dialogRef.afterClosed
      .pipe(
        filter(data => !!data),
        tap((data) => {
          this.getZones();
          this.cdr.detectChanges();
        }),
        takeUntil(this.destroy$),
      ).subscribe();
  }

  getCountryName = (code) => {
    return this.countries.find(country => country.value.toLowerCase() === code?.toLowerCase())?.label;
  };

  onDeleteItem = (ids) => {
    if (ids) {
      this.showDeleteConfirmation(this.getDeleteConfirmationContent(), ids);
    }
  };

  onItemContentContextMenu({ gridItem, menuItem }: PeGridItemContextSelect): void {
    if (menuItem?.value === ContextMenu.Edit) {
      this.actionClick(gridItem);
    }
    if (menuItem?.value === ContextMenu.Delete) {
      this.onDeleteItem([gridItem.id]);
    }
  }

  actionClick(gridItem) {
    const item = this.originItems.find(x => x._id === gridItem.id);
    const config: PeOverlayConfig = {
      data: { data: item, connections: this.connections, currency: this.currency, items: this.originItems },
      headerConfig: {
        title: item.name,
        backBtnTitle: this.translateService.translate('shipping-app.actions.cancel'),
        backBtnCallback: () => {
          this.showConfirmationWindow(this.getConfirmationContent('zone', 'editing'));
        },
        doneBtnTitle: this.translateService.translate('shipping-app.actions.done'),
        doneBtnCallback: () => {
          this.onSaveSubject$.next(this.dialogRef);
        },
        onSaveSubject$: this.onSaveSubject$,
        onSave$: this.onSave$,
      },
      backdropClick: () => {
        this.showConfirmationWindow(this.getConfirmationContent('zone', 'editing'));
      },
      component: PebShippingEditOptionsComponent,
    };
    this.dialogRef = this.overlayService.open(config);
    this.dialogRef.afterClosed
      .pipe(
        filter(data => !!data),
        tap((data) => {
          this.getZones();
          this.cdr.detectChanges();
        }),
      ).subscribe();
  }

  onViewportContextMenu({ menuItem }: PeGridViewportContextSelect): void {
    switch (menuItem?.value) {
      case ContextMenu.Paste:
        break;
    }
  }


  scrollBottom() {
    this.paginator.page += 1;
  }

  openSidebarFunc = () => {
    this.messageBus.emit('shipping.app.toggle.sidebar', false);
  };

  openProfileDialog(data) {
    const config: PeOverlayConfig = {
      data: { data: data, connections: this.connections, currency: this.currency, items: this.originItems },
      headerConfig: {
        title: data.name,
        backBtnTitle: this.translateService.translate('shipping-app.actions.cancel'),
        backBtnCallback: () => {
          this.showConfirmationWindow(this.getConfirmationContent('zone', 'editing'));
        },
        doneBtnTitle: this.translateService.translate('shipping-app.actions.done'),
        doneBtnCallback: () => {
          this.onSaveSubject$.next(this.dialogRef);
        },
        onSaveSubject$: this.onSaveSubject$,
        onSave$: this.onSave$,
      },
      backdropClick: () => {
        this.showConfirmationWindow(this.getConfirmationContent('zone', 'editing'));
      },
      component: PebShippingEditOptionsComponent,
    };
    this.dialogRef = this.overlayService.open(config);
    this.dialogRef.afterClosed
      .pipe(
        filter(data => !!data),
        tap((data) => {
          this.getZones();
          this.cdr.detectChanges();
        }),
      ).subscribe();
  }

  ngOnDestroy() {
    this.store.dispatch(new ClearStore());
    this.unselectAllItems();
  }
}
