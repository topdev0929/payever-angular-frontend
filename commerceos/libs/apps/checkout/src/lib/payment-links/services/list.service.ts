import { ChangeDetectorRef, Inject, Injectable } from '@angular/core';
import { SelectSnapshot } from '@ngxs-labs/select-snapshot';
import produce from 'immer';
import moment from 'moment';
import { BehaviorSubject } from 'rxjs';
import { tap } from 'rxjs/operators';

import { BusinessInterface } from '@pe/business';
import { EnvironmentConfigInterface, PE_ENV } from '@pe/common';
import { PeGridItem, PeGridItemType } from '@pe/grid';
import { CurrencyPipe, LocaleConstantsService } from '@pe/i18n';
import { BusinessState } from '@pe/user';

import { PaymentLinkStatusType, PaymentLinkStatusEnum, PaymentLinksInterface, FiltersFieldType, SearchPaymentLinksItem } from '../interfaces';

import { PaymentLinksApiService } from './payment-links-api.service';

@Injectable()
export class PaymentLinksListService {
  @SelectSnapshot(BusinessState.businessData) businessData: BusinessInterface;

  cdrComponent: ChangeDetectorRef;
  customFieldsRow: string[] = [];

  loadListTrigger$ = new BehaviorSubject<boolean>(null);
  loadFolders$ = new BehaviorSubject<boolean>(null)

  private itemsSubject = new BehaviorSubject<PeGridItem<PaymentLinksInterface>[]>([]);
  readonly items$ = this.itemsSubject.asObservable();

  get items(): PeGridItem<PaymentLinksInterface>[] {
    return this.itemsSubject.getValue();
  }

  set items(items: PeGridItem<PaymentLinksInterface>[]) {
    this.itemsSubject.next(items);
  }

  constructor(
    private paymentLinksApiService: PaymentLinksApiService,
    private localeConstantsService: LocaleConstantsService,
    private currencyPipe: CurrencyPipe,
    @Inject(PE_ENV) private env: EnvironmentConfigInterface,
  ) {
  }

  get locale(): string {
    return this.localeConstantsService.getLocaleId();
  }

  addItem(data: SearchPaymentLinksItem) {
    const gridItem = this.paymentLinkGridItemPipe(data)
    this.items = [
      gridItem,
      ...this.items
    ]
  }

  deleteItem(id: string) {
    this.items = this.items.filter(i => i.id !== id);
  }

  resetItems(): void {
    this.loadListTrigger$.next(true);
  }

  patchItem(id: string, data: Partial<PaymentLinksInterface>) {
    return this.paymentLinksApiService.patchLink(id, data).pipe(
      tap((data) => {
        const gridData = this.paymentLinkGridItemPipe(data);
        this.items = produce(this.items, (draft: PeGridItem<PaymentLinksInterface>[]) => {
          const idx = draft.findIndex(i => i.id === id);
          if (idx !== -1) {
            draft[idx] = gridData;
          }
        });
      }),
    );
  }

  getStatusColor(status: PaymentLinkStatusType): string {
    let color: string = null;
    switch (status) {
      case PaymentLinkStatusEnum.Active:
        color = 'green';
        break;
      case PaymentLinkStatusEnum.Deactivated:
        color = 'red';
        break;
    }

    return color;
  }

  destroy(): void {
    this.items = [];
    this.customFieldsRow = [];
    this.loadListTrigger$.next(null);
  }

  private getExpiresAt(paymentLink: PaymentLinksInterface | SearchPaymentLinksItem): string {
    let expiresAt = null;
    if ('expiresAt' in paymentLink) {
      expiresAt = paymentLink.expiresAt;
    } else if ('expires_at' in paymentLink) {
      expiresAt = paymentLink.expires_at;
    }

    return typeof expiresAt === 'string' ? expiresAt : 'Never';
  }

  private DateToView(value: string) {
    const date = moment(value, undefined, this.locale);
    const dateFormat = date?.toDate().toDateString() === new Date().toDateString()
      ? 'HH:mm'
      : 'DD MMMM YYYY HH:mm';

    return value && date.isValid()
      ? date.format(dateFormat)
      : value || 'Unknown';
  }

  paymentLinkGridItemPipe(paymentLink: PaymentLinksInterface | SearchPaymentLinksItem): PeGridItem<PaymentLinksInterface> {
    const id = 'serviceEntityId' in paymentLink ? paymentLink.serviceEntityId : paymentLink.id;
    const createdAt = 'createdAt' in paymentLink ? paymentLink.createdAt : paymentLink.created_at;
    const expiresAt = this.getExpiresAt(paymentLink);
    const redirectUrl = `${this.env.backend.checkout}/api/payment/link/${id}`;
    const data = {
      ...paymentLink,
      serviceEntityId: id,
      [FiltersFieldType.Amount]: paymentLink?.amount || 0,
      [FiltersFieldType.PaymentLink]: redirectUrl,
      [FiltersFieldType.ExpiresAt]: expiresAt,
      expiresAtView: this.DateToView(expiresAt),
      [FiltersFieldType.CreatedAt]: createdAt,
      createdAtView: this.DateToView(createdAt),
      [FiltersFieldType.Views]: paymentLink.viewsCount || 0,
      [FiltersFieldType.Transactions]: paymentLink.transactionsCount || 0,
      [FiltersFieldType.CreatorName]: paymentLink.creator_name || 'Unknown',
      [FiltersFieldType.Status]: paymentLink.isActive
        ? PaymentLinkStatusEnum.Active
        : PaymentLinkStatusEnum.Deactivated,
    };

    return {
      id: id,
      image: null,
      title: redirectUrl,
      type: PeGridItemType.Item,
      data,
      itemLoader$: new BehaviorSubject<boolean>(false),
      columns: [
        {
          name: FiltersFieldType.PaymentLink,
          value: redirectUrl,
        },
        {
          name: FiltersFieldType.ID,
          value: id,
        },
        {
          name: FiltersFieldType.Amount,
          value: this.currencyPipe.transform(
            data.amount?.toString() || 0, this.businessData.currency, undefined, undefined, this.locale
          ),
        },
        {
          name: FiltersFieldType.CreatorName,
          value: data.creator_name,
        },
        {
          name: FiltersFieldType.ExpiresAt,
          value: data.expiresAtView,
        },
        {
          name: FiltersFieldType.Views,
          value: data.views?.toString(),
        },
        {
          name: FiltersFieldType.Transactions,
          value: data.transactions?.toString(),
        },
        {
          name: FiltersFieldType.CreatedAt,
          value: data.createdAtView,
          customStyles: {
            opacity: '.6',
          },
        },
        {
          name: FiltersFieldType.Status,
          value: data.status,
        },
      ],
    };
  }
}
