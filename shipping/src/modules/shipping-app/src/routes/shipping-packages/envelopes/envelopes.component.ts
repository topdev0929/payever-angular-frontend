import {
  Component,
  OnInit,
  ViewChild,
  ChangeDetectorRef,
  ChangeDetectionStrategy,
  OnDestroy,
  HostListener, ViewContainerRef,
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
import { BehaviorSubject, Subject } from 'rxjs';
import { takeUntil, tap, catchError, take, delay } from 'rxjs/operators';
import { PebShippingPackagesService } from '../shipping-packages.service';
import { PebNewPackageComponent } from './new-package-modal/new-package.component';
import { PeOverlayWidgetService, PeOverlayRef, PeOverlayConfig } from '@pe/overlay-widget';
import { ShippingBoxInterface } from '../../../interfaces';
import { PackageTypeEnum } from '../../../enums/PackageTypeEnum';
import { TranslateService } from '@pe/i18n';
import { ConfirmDialogService } from '../../shipping-profiles/browse-products/dialogs/dialog-data.service';
import { filterDataGrid } from '../../../shared/data-grid-filter';
import { PebPackageBaseComponent } from '../package-base-component/package-base.component';
import { Overlay } from '@angular/cdk/overlay';

@Component({
  selector: 'peb-envelopes',
  templateUrl: './envelopes.component.html',
  styleUrls: ['./envelopes.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PebEnvelopesComponent extends PebPackageBaseComponent implements OnInit, OnDestroy {
  isFiltered = false;
  private showSidebarStream$ = new BehaviorSubject<boolean>(true);
  theme = this.envService.businessData?.themeSettings?.theme
    ? AppThemeEnum[this.envService.businessData?.themeSettings?.theme]
    : AppThemeEnum.default;

  private onDestroy$ = new Subject();
  isMobile = window.innerWidth <= 720;
  dialogRef: PeOverlayRef;
  onSaveSubject$ = new BehaviorSubject<any>(null);
  readonly onSave$ = this.onSaveSubject$.asObservable();
  searchItems = [];

  loadingItemIdStream$: BehaviorSubject<string> = new BehaviorSubject(null);

  categories = [];

  @ViewChild('dataGridComponent') set setDataGrid(dataGrid: PeDataGridComponent) {
    if (dataGrid?.showFilters$) {
      dataGrid.selectedItems = [];
      dataGrid.showFilters$.subscribe((value) => {
        if (value !== this.showSidebarStream$.value) {
          this.showSidebarStream$.next(value);
          this.showSidebarStream$.pipe(delay(300)).subscribe((val) => {
            if (!val) {
              dataGrid.animationDone();
            }
          });
        }
      });
    }
  }

  @ViewChild('dataGridComponent') dataGrid: PeDataGridComponent;

  set showSidebar(value: boolean) {
    this.showSidebarStream$.next(value);
  }

  constructor(
    private fb: FormBuilder,
    protected packageService: PebShippingPackagesService,
    protected cdr: ChangeDetectorRef,
    private sanitizer: DomSanitizer,
    private overlayService: PeOverlayWidgetService,
    private envService: EnvService,
    protected translateService: TranslateService,
    private confirmDialog: ConfirmDialogService,
    protected overlay: Overlay,
    protected viewContainerRef: ViewContainerRef,
  ) {
    super(overlay, viewContainerRef, packageService, cdr, translateService);
  }

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

  formGroup = this.fb.group({
    tree: [[]],
    toggle: [false],
  });

  singleSelectedAction: PeDataGridSingleSelectedAction = {
    label: 'Install',
    callback: (id: string) => {
      this.loadingItemIdStream$.next(id);
      setTimeout(() => {
        this.loadingItemIdStream$.next(null);
      }, 1000);
    },
  };

  secondSingleSelectedAction: PeDataGridSingleSelectedAction = {
    label: 'Edit',
    callback: (data: string) => {},
  };

  gridOptions = {
    nameTitle: this.translateService.translate('shipping-app.grid_fields.name'),
    customFieldsTitles: [
      this.translateService.translate('shipping-app.grid_fields.width'),
      this.translateService.translate('shipping-app.grid_fields.height'),
      this.translateService.translate('shipping-app.grid_fields.length'),
      this.translateService.translate('shipping-app.grid_fields.weight'),
    ],
  };

  filtersItems: PeDataGridFilterItems[] = [
    {
      value: this.gridOptions.nameTitle,
      label: this.gridOptions.nameTitle,
    }, ...this.gridOptions.customFieldsTitles
      .map((filter: string) => {
        return {
          value: filter,
          label: filter,
        };
      }),
  ];

  items: PeDataGridItem[] = [];
  filteredItems = [];

  addItemAction: PeDataGridSingleSelectedAction = {
    label: this.translateService.translate('shipping-app.actions.new_package'),
    callback: (settings) => {
      const config: PeOverlayConfig = {
        data: { new: PackageTypeEnum.Envelope },
        headerConfig: {
          title: this.translateService.translate('shipping-app.modal_header.title.new_package'),
          backBtnTitle: this.translateService.translate('shipping-app.actions.cancel'),
          backBtnCallback: () => {
            this.showConfirmationWindow(this.getConfirmationContent('package', 'adding'));
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
          this.showConfirmationWindow(this.getConfirmationContent('package', 'adding'));
        },
        component: PebNewPackageComponent,
      };
      this.dialogRef = this.overlayService.open(config);
      this.dialogRef.afterClosed
        .pipe(
          tap((data) => {
            if (data) {
              if (data?.kind === 'Carrier') {
                this.packageService
                  .addCarrierPackage(data?.data)
                  .pipe(
                    tap((_) => {
                      this.getItems();
                      this.cdr.detectChanges();
                    }),
                    catchError((err) => {
                      throw new Error(err.message);
                    }),
                  )
                  .subscribe();
              } else {
                this.packageService
                  .addPackage(data)
                  .pipe(
                    tap((_) => {
                      this.getItems();
                      this.cdr.detectChanges();
                    }),
                    catchError((err) => {
                      throw new Error(err);
                    }),
                  )
                  .subscribe();
              }
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
        data: { data: item },
        headerConfig: {
          title: this.translateService.translate('shipping-app.modal_header.title.edit_package'),
          backBtnTitle: this.translateService.translate('shipping-app.actions.cancel'),
          backBtnCallback: () => {
            this.showConfirmationWindow(this.getConfirmationContent('package', 'editing'));
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
          this.showConfirmationWindow(this.getConfirmationContent('package', 'editing'));
        },
        component: PebNewPackageComponent,
      };
      this.dialogRef = this.overlayService.open(config);
      this.dialogRef.afterClosed
        .pipe(
          tap((data) => {
            if (data) {
              this.packageService
                .editPackage(data.id, data.data)
                .pipe(
                  tap((_) => {
                    this.getItems();
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
    title: this.translateService.translate('shipping-app.actions.new_package'),
    actions: [this.addItemAction],
  };

  refreshSubject$ = new BehaviorSubject(true);
  readonly refresh$ = this.refreshSubject$.asObservable();

  multipleSelectedActions: PeDataGridMultipleSelectedAction[] = [
    {
      label: this.translateService.translate('shipping-app.actions.choose'),
      appearance: PeDataGridButtonAppearance.Link,
      actions: [
        {
          label: this.translateService.translate('shipping-app.actions.delete_selected'),
          callback: (ids: string[]) => {
            ids.forEach((id) => {
              this.packageService
                .deletePackage(id)
                .pipe(
                  tap((_) => {
                    this.getItems();
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

  getItems() {
    this.packageService.getEnvelopes().subscribe((envelopes: ShippingBoxInterface[]) => {
      this.items = [];
      envelopes.forEach((envelope) => {
        this.items.push({
          id: envelope._id,
          labels: envelope.isDefault ? ['Default'] : [],
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
                <span style="
                  font-weight: bold;">
                  ${envelope.type.substr(0, 3)}
                </span>
              </div>
              <span>${envelope.name}</span>
            </div>
          `),
          customFields: [
            {
              content: this.sanitizer.bypassSecurityTrustHtml(`
                <span>${envelope.width} ${envelope.dimensionUnit}</span>
            `),
            },
            {
              content: this.sanitizer.bypassSecurityTrustHtml(`
                <span>${envelope.height} ${envelope.dimensionUnit}</span>
            `),
            },
            {
              content: this.sanitizer.bypassSecurityTrustHtml(`
                <span>${envelope.length} ${envelope.dimensionUnit}</span>
            `),
            },
            {
              content: this.sanitizer.bypassSecurityTrustHtml(`
                <span>${envelope.weight} ${envelope.weightUnit}</span>
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
                const id = envelope._id;

                const item = this.items.find((x) => x.id === id);

                const config: PeOverlayConfig = {
                  data: { data: item },
                  headerConfig: {
                    title: this.translateService.translate('shipping-app.modal_header.title.edit_package'),
                    backBtnTitle: this.translateService.translate('shipping-app.actions.cancel'),
                    backBtnCallback: () => {
                      this.showConfirmationWindow(this.getConfirmationContent('package', 'editing'));
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
                    this.showConfirmationWindow(this.getConfirmationContent('package', 'editing'));
                  },
                  component: PebNewPackageComponent,
                };
                this.dialogRef = this.overlayService.open(config);
                this.dialogRef.afterClosed
                  .pipe(
                    tap((data) => {
                      if (data) {
                        this.packageService
                          .editPackage(data.id, data.data)
                          .pipe(
                            tap((_) => {
                              this.getItems();
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
            },
          ],
          data: envelope,
          actions: [this.editItemAction],
        });
      });
      this.packageService.refreshTreeData.next(null);
      this.cdr.detectChanges();
    });
  }

  ngOnInit() {
    this.packageService.refreshData$
      .pipe(takeUntil(this.onDestroy$))
      .subscribe((value) => {
        this.getItems();
      });
    this.getItems();
    this.fillContextMenu();

    this.filteredItems = this.items;
  }

  @HostListener('window:resize', ['$event'])
  onResize() {
    this.isMobile = window.innerWidth <= 720;
  }

  ngOnDestroy() {
    this.onDestroy$.next();
    this.destroyed$.next();
    this.destroyed$.complete();
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
    this.packageService.isSidebarClosed$.next(!this.packageService.isSidebarClosed$.value);
  }
}
