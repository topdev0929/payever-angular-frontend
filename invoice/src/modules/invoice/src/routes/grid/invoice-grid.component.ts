import { ChangeDetectionStrategy, ChangeDetectorRef, Component, Inject, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { MatDialog, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { ActivatedRoute } from '@angular/router';
import { Select, Store } from '@ngxs/store';
import {
  EnvService,
  MenuSidebarFooterData,
  PeDataGridButtonAppearance,
  PeDataGridItem,
  PeDataGridLayoutType,
  PeDataGridMultipleSelectedAction,
  PeDataGridSortByAction,
  PeDataGridSortByActionIcon,
  TreeFilterNode,
  MessageBus,
  PeDestroyService,
  PeDataGridListOptions
} from '@pe/common';
import { TranslateService } from '@pe/i18n-core';
import { PeOverlayConfig, PeOverlayWidgetService } from '@pe/overlay-widget';
import { TreeSidebarFilterComponent } from '@pe/sidebar';
import { BehaviorSubject, EMPTY, forkJoin, Observable } from 'rxjs';
import { takeUntil, tap, take, filter, finalize, catchError } from 'rxjs/operators';
import { EditFolderComponent } from '../../components/edit-folder/edit-folder.component';
import { InvoiceTreeDataInterface } from '../../constants';
import { PeInvoiceApi } from '../../services/abstract.invoice.api';
import { PebInvoiceGridService } from './invoice-grid.service';
import { FilterStore, OrderStore, InitLoadInvoiceFolders, DeleteInvoices, InitLoadCurrencies, InitLoadLanguages } from './store/folders.actions';
import { InvoicesAppState } from './store/invoices.state';
import { ConfirmActionDialogComponent } from '@pe/confirm-action-dialog';
import { AppThemeEnum } from '@pe/common';
import { InvoiceEnvService } from '../../services/invoice-env.service';
import { PeCreateInvoiceComponent } from '../../components/create-invoice/create-invoice.component';
import { DataGridContextMenuEnum, PeDataGridSidebarService } from '@pe/data-grid';
import { CommonService } from '../../services/common.service';
import { cloneDeep, isEmpty } from 'lodash';

@Component({
  selector: 'pe-invoice-grid',
  templateUrl: './invoice-grid.component.html',
  styleUrls: ['./invoice-grid.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [PeDestroyService]
})
export class PeInvoiceGridComponent implements OnInit, OnDestroy {
  theme = this.envService.businessData?.themeSettings?.theme
  ? AppThemeEnum[this.envService.businessData.themeSettings.theme]
  : AppThemeEnum.default;
  contextMenuItems = [DataGridContextMenuEnum.Delete, DataGridContextMenuEnum.Edit];
  items: PeDataGridItem[] = [];
  searchItems = [];
  leftPaneButtons = [];
  currencies = [];
  languages = [];
  order: string = '';
  resetButton = {
    title: this.translateService.translate('builder-themes.actions.reset'),
    onClick: () => {
      this.resetSearchItems();
    },
  };
  viewMode: PeDataGridLayoutType;
  layoutTypes = PeDataGridLayoutType;
  itemHeight: number = 255;
  invoicesTreeData: TreeFilterNode<InvoiceTreeDataInterface>[] = [];
  updateItem = null;
  saveSubject$ = new BehaviorSubject(null);
  readonly destroyed$ = this.destroy$.asObservable();
  gridItems: PeDataGridItem[] = [];
  @ViewChild('treeSidebar') treeSidebar: TreeSidebarFilterComponent;
  @Select(InvoicesAppState.filteredInvoices) gridItems$: Observable<PeDataGridItem[]>;

  public multipleSelectedActions: PeDataGridMultipleSelectedAction[] = [
    {
      label: "Options",
      appearance: PeDataGridButtonAppearance.Button,
      actions: [
        {
          label: 'Select All',
          callback: (e) => {
            const items = this.gridItems ? this.gridItems.map(item => item.id) : [];
            this.invoiceService.selectedItems = items;
            this.cdr.detectChanges();
            this.cdr.detectChanges();
          },
        },
        {
          label: 'Deselect All',
          callback: (e) => {
            this.invoiceService.selectedItems = [];
            this.cdr.detectChanges();
          },
        },
        // {
        //   label: 'Duplicate',
        //   callback: (e) => {
        //     const folderIds = [];
        //     const itemIds = [];
        //     this.gridItems.forEach((element) => {
        //       if (e.includes(element.id)) {

        //         if (!element.data.isFolder) {
        //           itemIds.push(element.id);
        //         } else {
        //           folderIds.push(element.id);
        //         }
        //       }
        //     });
        //     if (itemIds.length) {
        //       this.invoiceService.onDuplicate(itemIds).subscribe(() => {
        //         this.cdr.detectChanges();
        //       });
        //     }
        //     if (folderIds.length) {
        //       // this.onDuplicateAlbum(folderIds);
        //     }
        //   },
        // },
        {
          label: 'Delete',
          callback: (e) => {
            const itemsToDelete = this.gridItems.filter(item => e.includes(item.id));
            // const folders = itemsToDelete.filter(item => item.data?.isFolder);

            const dialogRef = this.dialog.open(ConfirmActionDialogComponent, {
              panelClass: 'pages-confirm-dialog',
              hasBackdrop: true,
              backdropClass: 'confirm-dialog-backdrop',
              data: {
                cancelButtonTitle: this.translateService.translate('invoice-app.actions.cancel'),
                confirmButtonTitle: this.translateService.translate('invoice-app.actions.delete'),
                title: this.translateService.translate('invoice-app.dialogs.messages.approve_title'),
                subtitle: this.translateService.translate('invoice-app.dialogs.messages.approve_subtitle'),
                theme: this.theme,
              },
            });
            dialogRef.afterClosed().pipe(
              filter(res => !!res),
              tap((res) => {
                const invoices: any = itemsToDelete.filter(item => !item.data?.isFolder);
                const requests = [
                  // ...folders.map(folder => this.api.deleteFolders(folder.id)),
                  ...invoices.map(album => this.api.deleteInvoice(album.id).pipe(tap(() => {
                    const parent = this.treeSidebar.treeControl.getDescendants(album);
                    if (!parent.length) {
                      this.treeSidebar.tree = this.treeSidebar.tree.filter(al => album.id !== al.id);
                    } else {
                      parent[0].children = parent[0].children.filter(al => album.id !== al.id);
                    }
                  })))
                ]
                return forkJoin(requests)
                  .pipe(
                    finalize(() => {
                      this.invoiceService.selectedItems = [];
                      this.cdr.detectChanges();
                    }),
                    tap(() => {
                      this.store.dispatch(new DeleteInvoices(itemsToDelete.map(item => item.id)));
                      this.invoiceService.openSnackbar(this.translateService.translate('invoice-app.info.items_deleted'), true);
                    }),
                    catchError((err) => {
                      this.invoiceService.openSnackbar(this.translateService.translate('invoice-app.info.items_not_deleted'), false);

                      return EMPTY;
                    }),
                    take(1),
                  ).subscribe();
              }),
              takeUntil(this.destroyed$),
            ).subscribe();
          }
        },
      ]
    }
  ];
  // grid context menu

  onSelectedItemsChanged(items: string[]) {
    this.invoiceService.selectedItems = items;
  }

  onGridContentContextMenu(data) {
    switch (data.event) {
      case DataGridContextMenuEnum.Delete:
        if(data.item?.data?.isFolder) {
          // this.deleteFolder(data.item);
        } else {
          this.delete(data.item);
        }
        break;
        case DataGridContextMenuEnum.Edit:
          if(data.item?.data?.isFolder) {
            // this.deleteFolder(data.item);
          } else {
            this.createEditInvoice(data.item.invoice);
          }
          break;
    }
  }

  public delete(invoice) {
    const dialogRef = this.dialog.open(ConfirmActionDialogComponent, {
      panelClass: 'pages-confirm-dialog',
      hasBackdrop: true,
      backdropClass: 'confirm-dialog-backdrop',
      data: {
        cancelButtonTitle: this.translateService.translate('invoice-app.actions.cancel'),
        confirmButtonTitle: this.translateService.translate('invoice-app.actions.delete'),
        title: this.translateService.translate('invoice-app.dialogs.messages.approve_title'),
        subtitle: this.translateService.translate('invoice-app.dialogs.messages.approve_subtitle'),
        theme: this.theme,
      },
    });
    dialogRef.afterClosed().pipe(
      filter(res => !!res),
      tap((res) => {
        this.api.deleteInvoice(invoice.id).pipe(
          tap(() => {
            const parent = this.treeSidebar.treeControl.getDescendants(invoice);
            if (!parent.length) {
              this.treeSidebar.tree = this.treeSidebar.tree.filter(al => invoice.id !== al.id);
            } else {
              parent[0].children = parent[0].children.filter(al => invoice.id !== al.id);
            }
            this.store.dispatch(new DeleteInvoices(invoice.id));
            this.invoiceService.openSnackbar(this.translateService.translate('invoice-app.info.items_deleted'), true);
            const deleteItem = this.invoiceService.selectedItems.findIndex((item) => item === invoice.id);
            if(deleteItem != -1) {
              this.invoiceService.selectedItems.splice(deleteItem, 1);
            }
            this.cdr.detectChanges();
          }),
          catchError((err) => {
            this.invoiceService.openSnackbar(this.translateService.translate('invoice-app.info.items_not_deleted'), false);

            return EMPTY;
          }),
          take(1)
        ).subscribe();
      })
    ).subscribe();
  }

  public sortByActions: PeDataGridSortByAction[] = [
    {
      label: 'Asc',
      callback: () => {
        // const desc: any = orderBy(this.items, ['title'], ['desc']);
        // const asc: any = orderBy(this.items, ['title'], ['asc']);

        // this.items = isEqual(this.items, desc) ? asc : desc;
        this.store.dispatch(new OrderStore('asc'));
        this.cdr.detectChanges();
      },
      icon: PeDataGridSortByActionIcon.Ascending
    },
    {
      label: 'Desc',
      callback: () => {
        this.store.dispatch(new OrderStore('desc'));
        this.cdr.detectChanges();
      },
      icon: PeDataGridSortByActionIcon.Descending
    }
  ];

  formGroup: any = this.formBuilder.group({
    tree: [[]],
    toggle: [false]
  });

  dataGridListOptions: PeDataGridListOptions = {
    nameTitle: 'Name',
    customFieldsTitles: ['Date', 'Due Date', 'Amount', 'Status'],
  };

  filterItems = [{
    label: this.translateService.translate('invoice-app.common.invoice.name'),
    value: 'title',
  }]
  initialFilterItem = this.filterItems[0];

  treeLabelInvoice: string = this.translateService.translate('invoice-app.common.invoice.my_invoices');


  sidebarFooterData: MenuSidebarFooterData = {
    headItem: { title: 'Options' },
    menuItems: [
      { title: this.translateService.translate('invoice-app.common.invoice.add_new_folder'), onClick: () => {
        this.openOverlay({ type: 'add_new', activeItem: {}, theme: this.theme }, null);
      } },
    ]
  };

  gridOptions: any = {
    nameTitle: '',
    customFieldsTitles: []
  };

  addItem: PeDataGridItem = {
    id: '0',
    image: '',
    selected: false
  };

  constructor(
    @Inject('PEB_ENTITY_NAME') private entityName: string,
    @Inject(MAT_DIALOG_DATA) public dialogData: any,
    @Inject(EnvService) protected envService: InvoiceEnvService,
    private formBuilder: FormBuilder,
    private api: PeInvoiceApi,
    public invoiceService: PebInvoiceGridService,
    private overlayWidget: PeOverlayWidgetService,
    private dialog: MatDialog,
    private commonService: CommonService,
    private readonly destroy$: PeDestroyService,
    public sidebarService: PeDataGridSidebarService,
    private store: Store,
    private translateService: TranslateService,
    private cdr: ChangeDetectorRef,
  ) {
  }

  ngOnInit(): void {
    this.currencies = this.store.selectSnapshot(InvoicesAppState.currencies);
    this.languages = this.store.selectSnapshot(InvoicesAppState.languages);
    this.invoiceService.callObservable.pipe(
      takeUntil(this.destroyed$),
    ).subscribe((invoice) => {
      this.createEditInvoice(invoice);
    });
    this.invoicesTreeData = this.invoiceService.invoiceFolderToTreeItem();
    this.viewMode = localStorage.getItem(`defaultInvoiceGridLayout_${this.entityName}`) as PeDataGridLayoutType || PeDataGridLayoutType.Grid;
    this.formGroup.valueChanges.pipe(
      takeUntil(this.destroyed$),
    ).subscribe();

    if (!this.currencies?.length) {
      forkJoin([
        this.commonService.getCurrencyList(),
        this.commonService.getLanguagesList()
      ])
        .pipe(tap(([currencies, languages]) => {
          this.currencies = currencies;
          this.languages = languages;
          this.store.dispatch(new InitLoadCurrencies(currencies));
          this.store.dispatch(new InitLoadLanguages(languages));
        })).pipe(
          takeUntil(this.destroyed$),
        ).subscribe();
    }
    const invoiceItems = this.store.selectSnapshot(InvoicesAppState.gridItems);
    if(!invoiceItems?.length) {
      this.api.getInvoiceList().subscribe(invoices => {
        this.items = invoices.map(invoice => {
          invoice = this.invoiceService.invoiceMapper(invoice);
          invoice.actions = this.getActions(invoice);
          return invoice;
        });
        const group = this.viewMode === PeDataGridLayoutType.List;
        this.store.dispatch(new InitLoadInvoiceFolders(this.items, group));
        this.formGroup.controls.tree.patchValue([this.invoicesTreeData[0]]);
        this.cdr.detectChanges();
      });
    }
    this.gridItems$.pipe(takeUntil(this.destroy$)).subscribe((data) => {
      this.gridItems = data;
    });
    this.saveSubject$.subscribe((data) => {
      if (data?.appData.type === 'edit') {
        this.updateItem.name = data.updatedItem.name;
        this.updateItem.image = data.updatedItem.icon;
        if (this.invoiceService.activeNode?.id === data.updatedItem.parent) {
          // this.store.dispatch(new EditItem(this.themeService.folderToItemMapper(data.updatedItem)));
        }
        this.cdr.detectChanges();
      }
      if (data?.appData.type === 'add_new') {
        if (this.updateItem) {
          this.treeSidebar.toggleExpanded.next(this.updateItem);
          this.treeSidebar.treeControl.expand(this.updateItem);
          if (this.invoiceService.activeNode?.id === data.updatedItem.parent) {
            // this.store.dispatch(new AddItem(this.themeService.folderToItemMapper(data.updatedItem)));
          }
        } else {
          this.treeSidebar.tree = [
            ...this.treeSidebar.tree,
            this.invoiceService.folderToFolderMapper(data.updatedItem),
          ];
          if (!this.invoiceService.activeNode) {
            // this.store.dispatch(new AddItem(this.themeService.folderToItemMapper(data.updatedItem)));
          }
        }

      }
      this.cdr.detectChanges();
      this.cdr.markForCheck();
    });
  }

  openOverlay(data, node) {
    this.updateItem = node;
    const config: PeOverlayConfig = {
      hasBackdrop: true,
      component: EditFolderComponent,
      data: { ...data, item: node },
      backdropClass: 'settings-backdrop',
      panelClass: 'studio-widget-panel',
      headerConfig: {
        title: node?.name || node?.title || this.translateService.translate('invoice-app.common.invoice.new_folder'),
        backBtnTitle: this.translateService.translate('invoice-app.actions.cancel'),
        removeContentPadding: false,
        theme: this.theme,
        backBtnCallback: () => {
          this.close();
          // this.overlayWidget.close();
        },
        cancelBtnTitle: '',
        cancelBtnCallback: () => {
          this.close();
        },
        doneBtnTitle: this.translateService.translate('invoice-app.actions.done'),
        doneBtnCallback: () => {
          this.close();
        },
        onSaveSubject$: this.saveSubject$,
      },
      backdropClick: () => {
        this.close();
      },
    };
    this.overlayWidget.open(
      config,
    );
  }

  getActions(invoice) {
    return [{
      label: this.translateService.translate('invoice-app.actions.edit'),
      actionClass: 'action',
      callback: () => {
        this.invoiceService.callSubject.next(invoice.invoice);
      },
    }]
  }

  close() {

    const dialogRef = this.dialog.open(ConfirmActionDialogComponent, {
      panelClass: 'pages-confirm-dialog',
      hasBackdrop: true,
      backdropClass: 'confirm-dialog-backdrop',
      data: {
        title: this.translateService.translate('invoice-app.dialogs.window_exit.title'),
        subtitle: this.translateService.translate('invoice-app.dialogs.window_exit.label'),
        confirmButtonTitle: this.translateService.translate('invoice-app.dialogs.window_exit.confirm'),
        cancelButtonTitle: this.translateService.translate('invoice-app.dialogs.window_exit.decline'),
        theme: this.theme,
      },
    });

    dialogRef.afterClosed().pipe(
      takeUntil(this.destroyed$),
      filter(res => !!res),
      tap((res) => {
        this.overlayWidget.close();
      }),
    ).subscribe();
  }

  ngOnDestroy(): void {
  }

  onFiltersChanged(event): void {
    console.log(event);
  }

  onSearchChanged(e: any): void {
    this.searchItems = [...this.searchItems, e];
    this.leftPaneButtons = this.searchItems.length ? [this.resetButton] : [];

    this.initialFilterItem = Object.assign([], this.filterItems[0]);
    this.store.dispatch(new FilterStore([...this.searchItems]));
    // this.cdr.detectChanges();
    this.cdr.markForCheck();
  }

  createEditInvoice(data: any = {}) {
    const header = isEmpty(data) ? 'Create Invoice' : 'Edit Invoice';
    data = {...data, currencies: this.currencies, languages: this.languages}
    const config: PeOverlayConfig = {
      hasBackdrop: true,
      component: PeCreateInvoiceComponent,
      data,
      backdropClass: 'settings-backdrop',
      panelClass: 'create-invoice-panel',
      headerConfig: {
        title: header,
        backBtnTitle: 'Cancel',
        theme: this.theme,
        backBtnCallback: () => { this.close()},
        cancelBtnTitle: '',
        cancelBtnCallback: () => { this.close()},
        doneBtnTitle: 'Done',
        doneBtnCallback: () => { },
      },
      backdropClick: () => {
        this.close();
      },
    }

    this.overlayWidget.open(config);
  }

  onSearchRemove(e) {
    this.searchItems.splice(e, 1);
    this.leftPaneButtons = this.searchItems.length ? [this.resetButton] : [];
    this.store.dispatch(new FilterStore([...this.searchItems]));
  }

  resetSearchItems = () => {
    this.searchItems = [];
    this.leftPaneButtons = [];
    this.store.dispatch(new FilterStore([]));
  }

  onNodeclick(items) {
    // this.formGroup.get('filtersTree').setValue([]);
    // this.treeFilter.selectionModel.select(null);
    // this.treeFilter.value = [];
    // this.treeSidebar.value = items;
  }

  onLayoutChanged(layout: PeDataGridLayoutType) {
    localStorage.setItem(`defaultInvoiceGridLayout_${this.entityName}`, layout);
    this.viewMode = layout;
  }
}
