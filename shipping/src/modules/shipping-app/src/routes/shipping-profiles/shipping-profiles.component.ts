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
  PeDataGridButtonAppearance,
  PeDataGridItem,
  PeDataGridMultipleSelectedAction,
  PeDataGridSingleSelectedAction,
  PeDataGridSortByAction,
  PeDataGridSortByActionIcon,
  AppThemeEnum,
  EnvService, PeDataGridFilterItems,
} from '@pe/common';
import { PeDataGridComponent } from '@pe/data-grid';
import { PeOverlayConfig, PeOverlayRef, PeOverlayWidgetService } from '@pe/overlay-widget';
import { BehaviorSubject, Observable } from 'rxjs';
import { catchError, delay, takeUntil, tap, map, take } from 'rxjs/operators';
import { AbstractComponent } from '../../misc/abstract.component';
import { PebShippingBusinessService } from '../../services/business-shipping.service';
import { PebShippingSettingsService } from '../../services/shipping-settings.service';
import { PebShippingConnectService } from '../connect/connect.service';
import { PebShippingProfileFormComponent } from './profiles-dialog/profiles-dialog.component';
import { TranslateService } from '@pe/i18n';
import { filterDataGrid } from '../../shared/data-grid-filter';
import { MatIconRegistry } from '@angular/material/icon';
import { ConfirmDialogService } from './browse-products/dialogs/dialog-data.service';
import { PebShippingSidebarService } from '../../services/sidebar.service';
import { ProductsListService } from './browse-products/services/products-list.service';
import { ProductsApiService } from './browse-products/services/api.service';
import { TemplatePortal } from '@angular/cdk/portal';
import { OverlayRef, Overlay } from '@angular/cdk/overlay';
import { OVERLAY_POSITIONS } from '../../constants';

@Component({
  selector: 'peb-shipping-profiles',
  templateUrl: './shipping-profiles.component.html',
  styleUrls: ['./shipping-profiles.component.scss'],
  providers: [ProductsListService, ProductsApiService],
  changeDetection: ChangeDetectionStrategy.OnPush,
})

export class PebShippingProfilesComponent extends AbstractComponent implements OnInit {
  private showSidebarStream$ = new BehaviorSubject<boolean>(true);
  isFiltered = false;
  showSidebar$ = this.showSidebarStream$.asObservable().pipe(delay(0));
  isMobile = window.innerWidth <= 720;
  theme = this.envService.businessData?.themeSettings?.theme
    ? AppThemeEnum[this.envService.businessData?.themeSettings?.theme]
    : AppThemeEnum.default;

  dialogRef: PeOverlayRef;
  contextRef: OverlayRef;
  contextMenuClickedItem: any;
  categories = [];
  connections = [];
  settings = {};
  products = [];
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
  };

  filterItems: PeDataGridFilterItems[] = [
    {
      value: this.gridOptions.nameTitle,
      label: this.gridOptions.nameTitle,
    },
  ];

  items: PeDataGridItem[] = [];
  filteredItems = [];

  addItemAction: PeDataGridSingleSelectedAction = {
    label: this.translateService.translate('shipping-app.actions.add_new'),
    callback: (data: string) => {
      const config: PeOverlayConfig = {
        data: { connections: this.connections, currency: this.currency, settings: this.settings, products: this.products },
        headerConfig: {
          title: this.translateService.translate('shipping-app.modal_header.title.new_shipping'),
          backBtnTitle: this.translateService.translate('shipping-app.actions.cancel'),
          backBtnCallback: () => {
            this.showConfirmationWindow(this.getConfirmationContent('profile', 'adding'));
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
          this.showConfirmationWindow(this.getConfirmationContent('profile', 'adding'));
        },
        component: PebShippingProfileFormComponent,
      };
      this.dialogRef = this.overlayService.open(config);
      this.dialogRef.afterClosed
        .pipe(
          tap((data) => {
            if (data) {
              this.shippingSettingsService
                .addProfile(data)
                .pipe(
                  tap((_) => {
                    this.getProfiles();
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
        data: { data: item.data, connections: this.connections, currency: this.currency, settings: this.settings, products: this.products },
        headerConfig: {
          title: item.data.name,
          backBtnTitle: this.translateService.translate('shipping-app.actions.cancel'),
          backBtnCallback: () => {
            this.showConfirmationWindow(this.getConfirmationContent('profile', 'editing'));
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
          this.showConfirmationWindow(this.getConfirmationContent('profile', 'editing'));
        },
        component: PebShippingProfileFormComponent,
      };
      this.dialogRef = this.overlayService.open(config);
      this.dialogRef.afterClosed
        .pipe(
          tap((data) => {
            if (data) {
              this.shippingSettingsService
                .editProfile(data.id, data.data)
                .pipe(
                  tap((_) => {
                    this.getProfiles();
                    this.cdr.detectChanges();
                  }),
                  catchError((err) => {
                    throw new Error(err);
                  }),
                )
                .subscribe();
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
    private shippingBusinessService: PebShippingBusinessService,
    private envService: EnvService,
    protected translateService: TranslateService,
    private matIconRegistry: MatIconRegistry,
    private domSanitizer: DomSanitizer,
    private sidebarService: PebShippingSidebarService,
    private productsListService: ProductsListService,
    public confirmDialog: ConfirmDialogService,
    protected overlay: Overlay,
    protected viewContainerRef: ViewContainerRef,
  ) {
    super(translateService);
    this.matIconRegistry.addSvgIcon(`edit-icon`, this.domSanitizer.bypassSecurityTrustResourceUrl('../assets/icons/edit-icon.svg'));
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
              this.shippingSettingsService
                .deleteProfile(id)
                .pipe(
                  tap((_) => {
                    this.getProfiles();
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
    this.getSettings();
    this.getProducts();
    this.getProfiles();
    this.fillContextMenu();
    this.connections = this.getConnections();
  }

  @HostListener('window:resize', ['$event'])
  onResize() {
    this.isMobile = window.innerWidth <= 720;
  }

  getProducts() {
    this.productsListService.loadProducts([]).pipe(take(1)).subscribe();
    this.productsListService.products$
      .pipe(
        tap((products) => {
          this.products = products;
        }),
        takeUntil(this.destroyed$),
      )
      .subscribe();
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
    this.shippingBusinessService.getShippingSettings().subscribe((responese: any) => {
      this.currency = responese.currency;
      this.cdr.detectChanges();
    });
    this.shippingSettingsService.getSettings().subscribe((response: any) => {
      const settings = response[0];
      if (settings) {
        settings.origins[0].phone = settings.origins[0].phone.split(' ')[1] ?? settings.origins[0].phone;
        this.settings = {
          zones: settings.zones,
          origins: settings.origins[0],
        };
      }
      this.cdr.detectChanges();
    });
  }

  getProfiles() {
    this.shippingSettingsService.getSettings().subscribe((response: any) => {
      this.items = [];
      this.cdr.detectChanges();
      const profiles = response;
      if (profiles) {
        profiles.forEach((profile) => {
          this.items.push({
            id: profile._id,
            labels: profile.isDefault ? ['Default'] : [],
            title: this.sanitizer.bypassSecurityTrustHtml(`
            <div style="
              display: flex;
              align-items: center;
            ">
              <div style="
                background-image: linear-gradient(to bottom, #fe9f04, #fa7421);
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
                <span style="font-weight: bold;">
                  ${profile?.name ? profile?.name?.substr(0, 3) : ''}
                </span>
              </div>
              <span>${profile?.name || '' }</span>
            </div>
            `),
            customFields: [
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
                  const item = this.items.find((x) => x.id === profile._id);

                  const config: PeOverlayConfig = {
                    data: {
                      data: item.data,
                      connections: this.connections,
                      currency: this.currency,
                      settings: this.settings,
                      products: this.products
                    },
                    headerConfig: {
                      title: item.data.name || this.translateService.translate('shipping-app.actions.add_new'),
                      backBtnTitle: this.translateService.translate('shipping-app.actions.cancel'),
                      backBtnCallback: () => {
                        this.showConfirmationWindow(this.getConfirmationContent('profile', 'editing'));
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
                      this.showConfirmationWindow(this.getConfirmationContent('profile', 'editing'));
                    },
                    component: PebShippingProfileFormComponent,
                  };
                  this.dialogRef = this.overlayService.open(config);
                  this.dialogRef.afterClosed
                    .pipe(
                      tap((data) => {
                        if (data) {
                          this.shippingSettingsService
                            .editProfile(data.id, data.data)
                            .pipe(
                              tap((_) => {
                                this.getProfiles();
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
            data: profile,
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
      this.shippingSettingsService
        .deleteProfile(this.contextMenuClickedItem.id)
        .pipe(
          tap((_) => {
            this.getProfiles();
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

  onDuplicateItem = (e) => {
    if (this.contextMenuClickedItem) {
      const profiles = {
        isDefault: false,
        name: this.contextMenuClickedItem.data.name,
        business: this.contextMenuClickedItem.business,
        products: this.contextMenuClickedItem.data.products?.map(val => val._id),
        zones: this.contextMenuClickedItem.data.zones.map(val => val._id),
        origins: this.contextMenuClickedItem.data.origins.map(val => val._id),
      };
      this.shippingSettingsService
        .addProfile(profiles)
        .pipe(
          tap((_) => {
            this.getProfiles();
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

  closeContextMenu() {
    if (this.contextRef) {
      this.contextRef.dispose();
    }
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
      {
        label: 'Duplicate',
        callback: this.onDuplicateItem,
      },
    ];
  }
}
