import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

import {
  CustomWidgetConfigInterface,
  PaymentMethodEnum,
  WidgetConfigInterface,
  WidgetTypeEnum
} from '@pe/checkout-types';

import {
  FinexpApiAbstractService,
  FinexpStorageAbstractService
} from '../../../../../modules/finexp-editor/src/services';
import { PaymentsViewInterface } from '../../../../../modules/finexp-editor/src/interfaces';
import { defaultCustomWidgetConfig } from '../../../../../modules/finexp-widget/constants';

@Component({
  selector: 'finexp-panel-channels',
  templateUrl: './channels.component.html',
  styleUrls: ['./channels.component.scss']
})
export class PanelChannelsComponent implements OnInit {
  widgets = Object.values(WidgetTypeEnum);

  widgetsSettings: WidgetConfigInterface[];

  payments: PaymentsViewInterface[] = [
    {
      paymentMethod: PaymentMethodEnum.SANTANDER_INSTALLMENT,
      amountLimits: {
        min: 0,
        max: 100
      }
    },
    {
      paymentMethod: PaymentMethodEnum.SANTANDER_FACTORING_DE,
      amountLimits: {
        min: 100,
        max: 200
      }
    },
    {
      paymentMethod: PaymentMethodEnum.SANTANDER_INSTALLMENT_DK,
      amountLimits: {
        min: 200,
        max: 300
      }
    },
    {
      paymentMethod: PaymentMethodEnum.SANTANDER_INSTALLMENT_NO,
      amountLimits: {
        min: 300,
        max: 400
      }
    }
  ];

  defaultWidgetConfig: CustomWidgetConfigInterface = {
    ...defaultCustomWidgetConfig,
    amountLimits: {
      min: 0,
      max: 10000
    },
    maxWidth: 500,
    checkoutId: this.checkoutUuid
  };

  get checkoutUuid(): string {
    return this.activatedRoute.snapshot.params['checkoutUuid'] || this.activatedRoute.parent.snapshot.params['checkoutUuid'];
  }

  get widgetType(): WidgetTypeEnum {
    return this.activatedRoute.snapshot.params['widgetType'] || this.activatedRoute.parent.snapshot.params['widgetType'] as WidgetTypeEnum;
  }

  constructor(
    private router: Router,
    private activatedRoute: ActivatedRoute,
    private apiService: FinexpApiAbstractService,
    private storageService: FinexpStorageAbstractService
  ) {
  }

  ngOnInit() {
    this.apiService.getWidgets(this.storageService.businessUuid, this.checkoutUuid)
      .subscribe(widgets => {
        this.widgetsSettings = widgets;
      });
  }

  openWidget(widget: WidgetTypeEnum) {
    const userChannelSettings = this.widgetsSettings.filter(settings => settings.type === widget)[0];
    if (userChannelSettings?._id) {
      this.router.navigate([`business/${this.storageService.businessUuid}/checkout/${this.checkoutUuid}/channels/${userChannelSettings._id}`]);
    } else {
      const data = this.defaultWidgetConfig;
      data.type = widget;
      delete data.widgetId;
      delete data.business;
      delete data.channelSet;
      delete data.cart;
      delete data.amount;
      delete data.reference;
      this.apiService.createWidgetSettings(this.storageService.businessUuid, data)
        .subscribe(settings => this.router.navigate([`business/${this.storageService.businessUuid}/checkout/${this.checkoutUuid}/channels/${settings._id}`]));
    }
  }
}
