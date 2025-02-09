import { Component, Inject, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Params, Router } from '@angular/router';
import { of, ReplaySubject, forkJoin } from 'rxjs';
import { switchMap, takeUntil } from 'rxjs/operators';

import { BusinessChannelInterface } from '@pe/ng-kit/modules/business';
import { DATE_TIME_FORMAT, TranslateService } from '@pe/ng-kit/modules/i18n';
import { AddressService } from '@pe/ng-kit/modules/address';
import { WindowService } from '@pe/ng-kit/modules/window';
import { StateService as ProductsStateService, ProductVariantInterface } from '@pe/checkout-sdk/sdk/products';

import { DetailService } from '../../services';
import { SettingsService, IconsService } from '../../../shared';

import {
  ActionInterface,
  DetailInterface,
  StatusType,
  StatusIconType,
  ActionUploadType,
  ItemInterface
} from '../../../shared';

import { channels } from '../../../shared/mocks';
import { forEach } from 'lodash-es';

@Component({
  selector: 'or-details',
  templateUrl: 'details.component.html',
  styleUrls: ['./details.component.scss']
})
export class DetailsComponent implements OnDestroy, OnInit {

  channels: { [propName: string]: BusinessChannelInterface } = null;
  order: DetailInterface = null;
  isMobile: boolean;
  uploadTypes: {
    value: ActionUploadType,
    label: string
  }[] = [
    {
      value: 'VERDIENSTNACHWEIS',
      label: this.translateService.translate('form.upload.upload_types.merit_prove')
    },
    {
      value: 'SELBSTAENDIGKEIT',
      label: this.translateService.translate('form.upload.upload_types.self_employment_prove')
    },
    {
      value: 'LEGITIMATION',
      label: this.translateService.translate('form.upload.upload_types.identification')
    },
    {
      value: 'SONSTIGES',
      label: this.translateService.translate('form.upload.upload_types.other')
    }
  ];

  private orderId: string = null;
  private destroyed$: ReplaySubject<boolean> = new ReplaySubject(1);

  constructor(
    private activatedRoute: ActivatedRoute,
    private addressService: AddressService,
    private detailService: DetailService,
    private iconsService: IconsService,
    private windowService: WindowService,
    private productsStateService: ProductsStateService,
    private router: Router,
    private settingsService: SettingsService,
    private translateService: TranslateService,
    @Inject(DATE_TIME_FORMAT) public dateTimeFormat: string,
  ) {}

  ngOnDestroy(): void {
    this.destroyed$.next(true);
    this.destroyed$.complete();
  }

  ngOnInit(): void {
    this.getBusinessChannelsData();

    this.activatedRoute.params.pipe(
      switchMap((params: Params) => {
        this.orderId = params['orderId'];
        this.settingsService.businessUuid = params['uuid'];
        return this.detailService.getData(this.settingsService.businessUuid, this.orderId, true);
      }))
      .subscribe(
        (order: DetailInterface): void => this.updateOrder(order),
        () => this.onGetDataError()
      );

    this.windowService.isMobile$.pipe(
      takeUntil(this.destroyed$))
      .subscribe((isMobile: boolean) => this.isMobile = isMobile);

    this.detailService.reset$.pipe(
      takeUntil(this.destroyed$))
      .subscribe((reset: boolean) => {
        if (reset) {
          this.getData();
        }
      });
  }

  get billingAddress(): string {
    return this.addressService.getAddressString(this.order.billing_address);
  }

  get billingAddressName(): string {
    return this.addressService.getNameString(this.order.billing_address);
  }

  get shippingAddress(): string {
    return this.addressService.getAddressString(this.order.shipping.address);
  }

  get shippingAddressName(): string {
    return this.addressService.getNameString(this.order.shipping.address);
  }
/*
  get translatedStatus(): string {
    return this.order.payment_option.type === 'santander_pos_installment'
      ? this.order.specific_status_translated
      : this.order.status_translated;
  }*/

  getPaymentMethodIconId(paymentMethodType: string): string {
    return this.iconsService.getPaymentMethodIconId(paymentMethodType);
  }

  getPaymentMethodName(paymentMethodType: string): string {
    return this.translateService.translate(`integrations.payments.${paymentMethodType}.title`);
  }

  getChannelIconId(channelType: string): string {
    return this.iconsService.getChannelIconId(channelType);
  }

  getTranslatedUploadType(uploadType: string): string {
    const translatedUploadType = this.uploadTypes.find(uploadTypeData => uploadTypeData.value === uploadType);
    return translatedUploadType.label;
  }

  statusIcon(status: StatusType): string {
    let icon: StatusIconType;
    switch (status) {
      case 'STATUS_NEW':
      case 'STATUS_IN_PROCESS':
        icon = 'pending';
        break;
      case 'STATUS_ACCEPTED':
      case 'STATUS_PAID':
        icon = 'ok';
        break;
      case 'STATUS_DECLINED':
      case 'STATUS_FAILED':
      case 'STATUS_CANCELLED':
        icon = 'minus';
        break;
      case 'STATUS_REFUNDED':
        icon = 'return';
        break;
      default:
        icon = '';
    }
    return icon;
  }

  makeVariantTitle(variant: ItemInterface): string {
    return this.productsStateService.makeVariantTitle(variant as any as ProductVariantInterface);
  }

  getData(): void {
    this.detailService.loading = true;
    this.detailService.getData(this.settingsService.businessUuid, this.orderId, true).subscribe(
      (order: DetailInterface) => {
        this.updateOrder(order);
        this.detailService.loading = false;
      },
      () => this.onGetDataError()
    );
  }

  private updateOrder(order: DetailInterface): void {
    this.orderId = order.transaction.uuid;
    this.order = order;
    this.updateOrderStatusColor();
  }

  private onGetDataError(): void {
    this.detailService.loading = false;
  }

  private getBusinessChannelsData(): void {
    of(channels).subscribe(
      (channels: BusinessChannelInterface[]) => {
        this.channels = {};
        channels.forEach((channel: BusinessChannelInterface) => {
          this.channels[channel.type] = channel;
        });
      }
    );
  }

  private updateOrderStatusColor(): void {
    let color: string = null;
    switch (this.order.status.general) {
      case 'STATUS_ACCEPTED':
      case 'STATUS_PAID':
        color = 'green';
        break;
      case 'STATUS_FAILED':
      case 'STATUS_CANCELLED':
      case 'STATUS_DECLINED':
        color = 'red';
        break;
      default:
        color = 'yellow';
        break;
    }
    this.order._statusColor = color; // Not needed anymore?
  }

}
