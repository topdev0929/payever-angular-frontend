import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  Injector,
  OnDestroy,
  OnInit,
} from '@angular/core';
import { BehaviorSubject, EMPTY, merge, of, Subject } from 'rxjs';
import { filter, takeUntil, tap, map, switchMap, catchError, take } from 'rxjs/operators';

import { PeDataGridPaginator, PeDestroyService } from '@pe/common';
import {
  FilterInterface,
  PeFilterKeyInterface,
  PeGridItem,
  PeGridItemColumn,
  PeGridItemContextSelect,
  PeGridMenu,
  PeGridTableDisplayedColumns,
  PeGridTableService,
  PeGridView,
} from '@pe/grid';
import { PeFilterChange, PeFilterConditions, PeFilterType } from '@pe/grid/shared';
import { TranslateService } from '@pe/i18n-core';
import { SnackbarService } from '@pe/snackbar';

import { LinkActionsEnum } from './components';
import { PaymentLinksInterface, SearchPaymentLinksInterface } from './interfaces';
import { ContextEnum } from './payment-links.constant';
import {
  PaymentLinkDialogService,
  PaymentLinkGridOptionsService,
  PaymentLinksApiService,
  PaymentLinksFilterService,
  PaymentLinksListService,
} from './services';

@Component({
  selector: 'pe-payment-links',
  templateUrl: './payment-links.component.html',
  styleUrls: ['./payment-links.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PaymentLinksComponent implements OnInit, OnDestroy {

  constructor(
    private injector: Injector,
    private translateService: TranslateService,
  ) { }

  private gridOptionsService = this.injector.get(PaymentLinkGridOptionsService);
  public toolbar = this.gridOptionsService.toolbar;
  public tableColumns: PeGridTableDisplayedColumns[] = this.gridOptionsService.getDisplayedColumns(PeGridView.TableWithScroll);
  public isLoading$: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(true);
  public gridLayout = PeGridView.TableWithScroll;
  public totalValue$ = new BehaviorSubject<string>('');
  public filterItems$ = new BehaviorSubject<FilterInterface[]>([]);
  public totalItems$ = new BehaviorSubject<number>(0);
  private deletePaymentLink$ = new Subject<string>()
  private duplicatePaymentLink$ = new Subject<string>()
  private patchPaymentLink$ = new Subject<{
    id: string,
    data: Partial<PaymentLinksInterface>,
  }>();

  private paginator: PeDataGridPaginator = {
    page: 0,
    perPage: 50,
    total: 10,
  }

  public listService = this.injector.get(PaymentLinksListService);
  public paymentLinksApiService = this.injector.get(PaymentLinksApiService);
  private tableService = this.injector.get(PeGridTableService);
  private paymentLinkDialogService = this.injector.get(PaymentLinkDialogService);
  private filterService = this.injector.get(PaymentLinksFilterService);
  private destroy$ = this.injector.get(PeDestroyService);
  private snackBarService = this.injector.get(SnackbarService);

  private cdr = this.injector.get(ChangeDetectorRef);

  public tableColumnsTrackBy(i: number, item: PeGridTableDisplayedColumns): string {
    return item.name;
  }

  createNewLink() {
    this.paymentLinkDialogService.createOrPatchLink();
  }

  onScrollLoad(): void {
    if (!this.isLoading$.value) {
      this.paginator.page += 1;
      this.listService.loadListTrigger$.next(false);
    }
  }


  itemContextMenu(item: PeGridItem): PeGridMenu {
    const menu = {
      title: this.translateService.translate('paymentLinks.grid.contextMenu.title'),
      items: [
        {
          label: this.translateService.translate('paymentLinks.grid.contextMenu.edit'),
          value: ContextEnum.Edit,
        },
        {
          label: this.translateService.translate('paymentLinks.grid.contextMenu.duplicate'),
          value: ContextEnum.Duplicate,
        },
        {
          label: this.translateService.translate(
            item.data.isActive
              ? 'paymentLinks.grid.contextMenu.deactivate'
              : 'paymentLinks.grid.contextMenu.activate'
          ),
          value: ContextEnum.ChangeIsActive,
        },
        {
          label: this.translateService.translate('paymentLinks.grid.contextMenu.delete'),
          value: ContextEnum.Delete,
        },
      ],
    };

    return menu;
  }

  onItemContentContextMenu({ gridItem, menuItem }: PeGridItemContextSelect) {
    switch (menuItem?.value) {
      case ContextEnum.Edit:
        this.paymentLinkDialogService.openAction$.next({
          type: LinkActionsEnum.prefill,
          paymentLinkId: gridItem.id,
        });
        break;
      case ContextEnum.Duplicate:
        this.duplicatePaymentLink$.next(gridItem.id);
        break;
      case ContextEnum.ChangeIsActive:
        const { isActive, expiresAt, createdAt } = gridItem.data;

        this.patchPaymentLink$.next({
          id: gridItem.id,
          data: {
            isActive: !isActive,
            expiresAt: !isActive && new Date(expiresAt) <= new Date() ?
              this.getNewExpireAt(createdAt, expiresAt) : undefined,
          },
        });
        break;
      case ContextEnum.Delete:
        this.deletePaymentLink$.next(gridItem.id);
        break;
    }
  }

  getCell(item: PeGridItem, columnName: string): PeGridItemColumn {
    if (!this.tableService.transformColumns[item.id]) {
      return null;
    }

    return this.tableService.transformColumns[item.id][columnName];
  }

  getCellValue(item: PeGridItem, columnName: string): any {
    return this.getCell(item, columnName)?.value;
  }

  actionClick(item: PeGridItem<never>) {
    this.paymentLinkDialogService.createOrPatchLink(item.id);
  }

  ngOnInit(): void {
    const duplicatePaymentLink$ = this.duplicatePaymentLink$.pipe(
      switchMap(id =>
        this.paymentLinksApiService.clone(id).pipe(
          tap(data => this.listService.addItem(data)),
          catchError(err => this.handelError(err)),
        )
      ),
    );

    const deletePaymentLink$ = this.deletePaymentLink$.pipe(
      switchMap(id =>
        this.paymentLinksApiService.deleteLink(id).pipe(
          tap(() => this.listService.deleteItem(id)),
          catchError(err => this.handelError(err)),
        )
      )
    );
    const patchPaymentLink$ = this.patchPaymentLink$.pipe(
      switchMap(({ id, data }) => this.listService.patchItem(id, data)),
    );
    const getValues$ = this.paymentLinksApiService.getValues().pipe(
      map(({ filters }) => filters.map((filter): FilterInterface | PeFilterKeyInterface => {
        return filter.fieldName === 'isActive'
          ? {
            ...filter,
            filterConditions: [
              PeFilterConditions.Is,
              PeFilterConditions.IsNot,
            ],
            type: PeFilterType.Option,
            options: [
              { label: 'paymentLinks.active', value: 'true' },
              { label: 'paymentLinks.deactivated', value: 'false' },
            ],
          }
          : filter;
      })),
      tap(filters => this.filterItems$.next(filters)),
    );

    this.onFiltersChange(this.filterService.searchItems.filter(item => !item.disableRemoveOption));

    const loadListTrigger$ = this.listService.loadListTrigger$.pipe(
      filter(d => d !== null && d !== undefined),
      switchMap((reset) => {
        if (Math.ceil(this.paginator.total / this.paginator.perPage) < this.paginator.page) {
          return EMPTY;
        }
        this.isLoading$.next(true);

        if (reset) {
          this.listService.items = [];
          this.paginator.page = 0;
        }

        return this.paymentLinksApiService.getFolderDocuments(this.getSearchData()).pipe(
          map(res => ({
            items: res.collection.map(i => this.listService.paymentLinkGridItemPipe(i)),
            pagination_data: res.pagination_data,
          })),
          catchError(() => of({
            pagination_data: {
              page: 0, total: 0,
            },
            items: [],
          })),
        );
      }),
      tap(({ items, pagination_data }) => {
        this.listService.items = this.listService.items.concat(items);
        this.setPaginator(pagination_data);
        this.isLoading$.next(false);
        this.cdr.detectChanges();
      }),
    );

    merge(
      duplicatePaymentLink$,
      loadListTrigger$,
      getValues$,
      patchPaymentLink$,
      deletePaymentLink$,
    ).pipe(
      takeUntil(this.destroy$),
    ).subscribe();

    this.listService.loadListTrigger$.next(true);
  }


  ngOnDestroy(): void {
    this.listService.destroy();
  }

  onFiltersChange(filterItems: PeFilterChange[]) {
    this.filterService.onFiltersChange(filterItems);
    this.paginator.page = 0;
    this.listService.resetItems();
  }

  onSortAction(orderBy: string, direction: string) {
    this.filterService.onSortAction(orderBy, direction);
    this.listService.resetItems();
  }

  getSearchData(): SearchPaymentLinksInterface {
    const { page, perPage } = this.paginator;

    return {
      page: page + 1,
      perPage,
      ...this.filterService.sortData,
      configuration: this.filterService.filterConfiguration,
    };
  }

  get searchItems() {
    return this.filterService.searchItems;
  }

  sortChange(sort: string): void {
    this.paginator.page = 0;
    const splitted = sort.split('.'); // 'creator_name.asc' => ['creator_name', 'asc']
    this.onSortAction(splitted[0], splitted[1]);
  }

  private handelError(err: Error) {
    this.showError(err.message);

    return of(null);
  }

  private showError(error: string): void {
    this.snackBarService.toggle(true, {
      content: error || 'Unknown error',
      duration: 5000,
      iconId: 'icon-alert-24',
      iconSize: 24,
    });
  }

  private setPaginator(data: { page: number, total: number }) {
    this.paginator = {
      ...this.paginator,
      page: data.page - 1,
      total: data.total,
    };
    this.totalItems$.next(data.total);
  }

  private getNewExpireAt(createdAt: string, oldExpireAt: string): Date {
    const diffInMillis = new Date(oldExpireAt).getTime() - new Date(createdAt).getTime();

    const newExpireAt = new Date(new Date().getTime() + diffInMillis);

    return newExpireAt;
  }
}
