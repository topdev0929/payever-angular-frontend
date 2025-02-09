import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  HostListener,
  OnInit,
  ViewChild,
  ViewContainerRef,
} from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { DomSanitizer } from '@angular/platform-browser';
import {
  AppThemeEnum,
  PeDataGridButtonAppearance,
  PeDataGridItem,
  PeDataGridMultipleSelectedAction,
  PeDataGridSingleSelectedAction,
  PeDataGridSortByAction,
  PeDataGridSortByActionIcon,
  EnvService, PeDataGridFilterItems,
} from '@pe/common';
import { PeDataGridComponent } from '@pe/data-grid';
import { PeOverlayConfig, PeOverlayRef, PeOverlayWidgetService } from '@pe/overlay-widget';
import { BehaviorSubject, Observable } from 'rxjs';
import { catchError, delay, takeUntil, tap, map, take } from 'rxjs/operators';
import { ShippingZoneInterface } from '../../interfaces';
import { AbstractComponent } from '../../misc/abstract.component';
import { PebShippingBusinessService } from '../../services/business-shipping.service';
import { PebShippingSettingsService } from '../../services/shipping-settings.service';
import { PebShippingZoneService } from '../../services/shipping-zone.service';
import { PebShippingConnectService } from '../connect/connect.service';
import { PebShippingEditOptionsComponent } from './edit-options-modal/edit-options.component';
import { LocaleConstantsService, TranslateService } from '@pe/i18n';
import { filterDataGrid } from '../../shared/data-grid-filter';
import { ConfirmDialogService } from '../shipping-profiles/browse-products/dialogs/dialog-data.service';
import { getCurrencySymbol } from '@angular/common';
import { PebShippingSidebarService } from '../../services/sidebar.service';
import { OVERLAY_POSITIONS } from '../../constants';
import { TemplatePortal } from '@angular/cdk/portal';
import { Overlay, OverlayRef } from '@angular/cdk/overlay';

@Component({
  selector: 'peb-shipping-options',
  templateUrl: './shipping-options.component.html',
  styleUrls: ['./shipping-options.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PebShippingOptionsComponent extends AbstractComponent implements OnInit {
  private showSidebarStream$ = new BehaviorSubject<boolean>(true);
  isFiltered = false;
  showSidebar$ = this.showSidebarStream$.asObservable().pipe(delay(0));
  isMobile = window.innerWidth <= 720;

  theme = this.envService.businessData?.themeSettings?.theme
    ? AppThemeEnum[this.envService.businessData?.themeSettings?.theme]
    : AppThemeEnum.default;
  dialogRef: PeOverlayRef;
  contextRef: OverlayRef;

  categories = [];
  connections = [];
  filteredItems = [];
  countries = [];
  contextMenuClickedItem: any;
  currency;
  contextActions = [];

  onSaveSubject$ = new BehaviorSubject<any>(null);
  readonly onSave$ = this.onSaveSubject$.asObservable();

  @ViewChild('dataGridComponent') set setDataGrid(dataGrid: PeDataGridComponent) {
    if (dataGrid?.showFilters$) {
      dataGrid.selectedItems = [];
      dataGrid.showFilters$.subscribe((value) => {
        if (value !== this.showSidebarStream$.value) {
          this.showSidebarStream$.next(value);
          this.showSidebar$.pipe(delay(300)).subscribe((val) => {
            if (!val) {
              dataGrid.animationDone();
            }
          });
        }
      });
    }
  }

  @ViewChild('dataGridComponent') dataGrid: PeDataGridComponent;
  searchItems = [];

  sortByActions: PeDataGridSortByAction[] = [
    {
      label: this.translateService.translate('shipping-app.sort_actions.name'),
      callback: () => {
        this.items.sort((a, b) => {
          const nameA = a.data?.name.toUpperCase();
          const nameB = b.data?.name.toUpperCase();
          if (nameA < nameB) {
            return -1;
          }
          if (nameA > nameB) {
            return 1;
          }

          return 0;
        });
      },
      icon: PeDataGridSortByActionIcon.Name,
    },
    {
      label: this.translateService.translate('shipping-app.sort_actions.date'),
      callback: () => {
        this.items.sort((a, b) => {
          const dateA = a.data?.updatedAt;
          const dateB = b.data?.updatedAt;
          if (dateA < dateB) {
            return -1;
          }
          if (dateA > dateB) {
            return 1;
          }

          return 0;
        });
      },
      icon: PeDataGridSortByActionIcon.Date,
    },
  ];
  isFilterCreating = false;

  set showSidebar(value: boolean) {
    this.showSidebarStream$.next(value);
  }

  loadingItemIdStream$: BehaviorSubject<string> = new BehaviorSubject(null);
  loadingItemId$: Observable<string> = this.loadingItemIdStream$.asObservable();

  formGroup = this.fb.group({
    tree: [[]],
    toggle: [false],
  });

  gridOptions = {
    nameTitle: this.translateService.translate('shipping-app.grid_fields.name'),
    customFieldsTitles: [this.translateService.translate('shipping-app.grid_fields.price')],
  };

  filterItems: PeDataGridFilterItems[] = [
    {
      value: this.gridOptions.nameTitle,
      label: this.gridOptions.nameTitle,
    }, {
      value: this.gridOptions.customFieldsTitles[0],
      label: this.gridOptions.customFieldsTitles[0],
    },
  ];

  items: PeDataGridItem[] = [];

  addItemAction: PeDataGridSingleSelectedAction = {
    label: this.translateService.translate('shipping-app.actions.add_new'),
    callback: (data: string) => {
      const config: PeOverlayConfig = {
        data: { connections: this.connections, currency: this.currency, items: this.items },
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
          theme: this.theme,
        },
        backdropClick: () => {
          this.showConfirmationWindow(this.getConfirmationContent('zone', 'adding'));
        },
        component: PebShippingEditOptionsComponent,
      };
      this.dialogRef = this.overlayService.open(config);
      this.dialogRef.afterClosed
        .pipe(
          tap((data) => {
            if (data) {
              this.shippingZoneService
                .addShippingZone(data)
                .pipe(
                  tap((_) => {
                    this.getZones();
                    this.cdr.detectChanges();
                  }),
                  catchError((err) => {
                    throw new Error(err);
                  }),
                )
                .subscribe();

              this.cdr.detectChanges();
            }
          }),
          takeUntil(this.destroyed$),
        )
        .subscribe();
    },
  };

  editItemAction: PeDataGridSingleSelectedAction = {
    label: this.translateService.translate('shipping-app.actions.edit'),
    callback: (data: string) => {
      const item = this.items.find((x) => x.id === data);
      const config: PeOverlayConfig = {
        data: { data: item.data, connections: this.connections, currency: this.currency, items: this.items },
        headerConfig: {
          title: item.data.name,
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
          theme: this.theme,
        },
        backdropClick: () => {
          this.showConfirmationWindow(this.getConfirmationContent('zone', 'editing'));
        },
        component: PebShippingEditOptionsComponent,
      };
      this.dialogRef = this.overlayService.open(config);
      this.dialogRef.afterClosed
        .pipe(
          tap((data) => {
            if (data) {
              this.shippingZoneService
                .editShippingZone(data.id, data.data)
                .pipe(
                  tap((_) => {
                    this.getZones();
                    this.cdr.detectChanges();
                  }),
                  catchError((err) => {
                    throw new Error(err);
                  }),
                )
                .subscribe();

              this.cdr.detectChanges();
            }
          }),
          takeUntil(this.destroyed$),
        )
        .subscribe();
    },
  };

  addNewItem = {
    title: this.translateService.translate('shipping-app.actions.add_new'),
    actions: [this.addItemAction],
  };

  refreshSubject$ = new BehaviorSubject(true);
  readonly refresh$ = this.refreshSubject$.asObservable();

  constructor(
    private fb: FormBuilder,
    private overlayService: PeOverlayWidgetService,
    private cdr: ChangeDetectorRef,
    private sanitizer: DomSanitizer,
    private shippingConnectService: PebShippingConnectService,
    private shippingSettingsService: PebShippingSettingsService,
    private shippingZoneService: PebShippingZoneService,
    private shippingBusinessService: PebShippingBusinessService,
    private envService: EnvService,
    protected translateService: TranslateService,
    private confirmDialog: ConfirmDialogService,
    private sidebarService: PebShippingSidebarService,
    private overlay: Overlay,
    private viewContainerRef: ViewContainerRef,
    private localConstantsService: LocaleConstantsService,
  ) {
    super(translateService);
  }

  multipleSelectedActions: PeDataGridMultipleSelectedAction[] = [
    {
      label: this.translateService.translate('shipping-app.actions.choose'),
      appearance: PeDataGridButtonAppearance.Link,
      actions: [
        {
          label: this.translateService.translate('shipping-app.actions.delete'),
          callback: (ids: string[]) => {
            ids.forEach((id) => {
              this.shippingZoneService
                .deleteShippingZone(id)
                .pipe(
                  tap((_) => {
                    this.getZones();
                    this.dataGrid.selectedItems = [];
                    this.cdr.detectChanges();
                  }),
                  catchError((err) => {
                    throw new Error(err);
                  }),
                )
                .subscribe();
            });
          },
        },
      ],
    },
  ];

  onBranchCreate(name, category) {
    category.title = name;
  }

  onFilterCreate(name) {}

  ngOnInit() {
    this.getCountries();
    this.getSettings();
    this.fillContextMenu();
    this.connections = this.getConnections();
  }

  @HostListener('window:resize', ['$event'])
  onResize() {
    this.isMobile = window.innerWidth <= 720;
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
          throw new Error(err);
        }),
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
    this.shippingBusinessService.getShippingSettings().subscribe((response: any) => {
      this.currency = response.currency;
      this.cdr.detectChanges();
      this.getZones();
    });
  }

  getZones() {
    this.shippingSettingsService.getSettings().subscribe((response: any) => {
      this.items = [];
      this.cdr.detectChanges();
      const zones = response[0]?.zones;
      if (zones) {
        zones.forEach((zone: ShippingZoneInterface) => {
          this.items.push({
            id: zone._id,
            title: this.sanitizer.bypassSecurityTrustHtml(`
            <div style="
              display: flex;
              align-items: center;
            ">
              <div style="
                background-image: ${zone.countryCodes[0] && zone.countryCodes[0] !== 'All'
                                    ? `none`
                                    : 'linear-gradient(to bottom, #fe9f04, #fa7421)'};
                font-family: 'Roboto', sans-serif;
                line-height: 1.33;
                font-size: 12px;
                display: flex;
                justify-content: center;
                align-items: center;
                margin-right: 12px;
                height: 32px;
                width: 32px;
                border-radius: 3.2px;
                color: #ffffff;
              ">
              ${
                zone.countryCodes[0] === 'All' || zone.countryCodes.length > 1
                  ? `<svg [style.width.px]="20" style="height: 70%;" color="white">
                        <use href="#icon-shipping-world-white"></use>
                   </svg>`
                  : `<svg [style.width.px]="20" style="height: 100%; border-radius: 3.2px;">
                        <use href="#icon-flag-${zone.countryCodes[0]?.toLowerCase()}"></use>
                   </svg>`
              }
              </div>
              <span>${zone.name}</span>
            </div>
            `),
            customFields: [
              {
                content: this.sanitizer.bypassSecurityTrustHtml(`
                <span>Starting from ${getCurrencySymbol(this.currency, 'narrow')} ${zone.rates[0]?.price} and up</span>
              `),
              },
              {
                content: this.sanitizer.bypassSecurityTrustHtml(`
                  <div style="
                    width: 100%;
                    height: 100%;
                    display: flex;
                    justify-content: flex-end;
                    align-items: center;
                  ">
                    <button style="
                      border-radius: 6px;
                      background-color: rgba(255, 255, 255, 0.3);
                      border: 0;
                      outline: 0;
                      color: white;
                      width: 51px;
                      height: 24px;
                      font-family: 'Roboto', sans-serif;
                      font-size: 12px;
                      font-weight: normal;
                      font-stretch: normal;
                      font-style: normal;
                      line-height: 1.33;
                      letter-spacing: normal;
                      text-align: center;
                      color: #ffffff;">Edit
                    </button>
                  </div>
                `),
                callback: () => {
                  const item = this.items.find((x) => x.id === zone._id);

                  const config: PeOverlayConfig = {
                    data: { data: item.data, connections: this.connections, currency: this.currency, items: this.items },
                    headerConfig: {
                      title: item.data.name || this.translateService.translate('shipping-app.actions.add_new'),
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
                      theme: this.theme,
                    },
                    backdropClick: () => {
                      this.showConfirmationWindow(this.getConfirmationContent('zone', 'editing'));
                    },
                    component: PebShippingEditOptionsComponent,
                  };
                  this.dialogRef = this.overlayService.open(config);
                  this.dialogRef.afterClosed
                    .pipe(
                      tap((data) => {
                        if (data) {
                          this.shippingZoneService
                            .editShippingZone(data.id, data.data)
                            .pipe(
                              tap((_) => {
                                this.getZones();
                                this.cdr.detectChanges();
                              }),
                              catchError((err) => {
                                throw new Error(err);
                              }),
                            )
                            .subscribe();
                          this.cdr.detectChanges();
                        }
                      }),
                      takeUntil(this.destroyed$),
                    )
                    .subscribe();
                },
              },
            ],
            data: zone,
            actions: [this.editItemAction],
          });
        });
        this.filteredItems = this.items;
        this.cdr.detectChanges();
      }
    });
  }

  onSearchChanged(e) {
    this.searchItems = [...this.searchItems, e];
    this.searchItems.length !== 0 ? (this.isFiltered = true) : (this.isFiltered = false);
    this.filteredItems = filterDataGrid(this.searchItems, this.items);
  }
  onSearchRemove(e) {
    this.searchItems.splice(e, 1);
    this.searchItems.length !== 0 ? (this.isFiltered = true) : (this.isFiltered = false);
    this.filteredItems = filterDataGrid(this.searchItems, this.items);
  }

  showConfirmationWindow(dialogContent) {
    this.confirmDialog.open({
      cancelButtonTitle: this.translateService.translate('shipping-app.actions.no'),
      confirmButtonTitle: this.translateService.translate('shipping-app.actions.yes'),
      ...dialogContent,
    });

    this.confirmDialog.onConfirmClick().pipe(
      take(1),
    ).subscribe(() => {
      this.dialogRef.close();
    });
  }

  onToggleSidebar(e) {
    this.sidebarService.toggleSidebar();
  }
  openContextMenu(event: any, item, context) {
    if (event) {
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
    }
  }

  onDeleteItem = (e) => {
    if (this.contextMenuClickedItem) {
      this.shippingZoneService
        .deleteShippingZone(this.contextMenuClickedItem.id)
        .pipe(
          tap((_) => {
            this.getZones();
            this.dataGrid.selectedItems = [];
            this.cdr.detectChanges();
          }),
          catchError((err) => {
            throw new Error(err);
          }),
        )
        .subscribe();
      this.contextRef.dispose();
      this.cdr.detectChanges();
    }
  }

  onEditItem = (event) => {
    if (this.contextMenuClickedItem) {
      this.editItemAction.callback(this.contextMenuClickedItem.id);
      this.contextRef.dispose();
      this.cdr.detectChanges();
    }
  }

  closeContextMenu() {
    if (this.contextRef) {
      this.contextRef.dispose();
    }
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
  getCountryName(code) {
    return this.countries.find((country) => country.value.toLowerCase() === code.toLowerCase()).label;
  }

  fillContextMenu() {
    this.contextActions = [
      {
        label: 'Edit',
        callback: this.onEditItem,
      },
      {
        label: 'Delete',
        callback: this.onDeleteItem,
      },
    ];
  }
}
