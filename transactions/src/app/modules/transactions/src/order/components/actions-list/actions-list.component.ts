import { Component, OnInit, Input, Output, EventEmitter, ChangeDetectorRef } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { ActivatedRoute, Params, Router } from '@angular/router';
import { ReplaySubject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import * as moment from 'moment';
import { forEach } from 'lodash-es';

import { SnackBarService } from '@pe/ng-kit/modules/snack-bar';
import { TranslateService } from '@pe/ng-kit/modules/i18n';
import { PaymentMethodEnum } from '@pe/checkout-sdk/sdk/types';
import { AddressInterface } from '@pe/ng-kit/modules/address';

import { DetailService } from '../../services';
import { SettingsService, ProcessShippingBillingAddressInterface, ShippingLabelInterface } from '../../../shared';

import {
  ActionInterface,
  MailActionInterface,
  DetailInterface,
  PaymentDetailsWithOrderInterface,
  ActionType,
  ProcessShippingOrderInterface,
  ApiService,
  UserBusinessInterface
} from '../../../shared';

const SHOW_CREDIT_ANSWER_TYPES: PaymentMethodEnum[] = [PaymentMethodEnum.SANTANDER_POS_INSTALLMENT, PaymentMethodEnum.SANTANDER_INSTALLMENT];

@Component({
  selector: 'or-actions-list',
  templateUrl: 'actions-list.component.html',
  styleUrls: ['./actions-list.component.scss']
})
export class ActionsListComponent implements OnInit {

  @Input() set order(orderData: DetailInterface) {
    this.orderData = orderData;
    this.prepareActionsForUI();
  }
  get order(): DetailInterface {
    return this.orderData;
  }

  @Output() refresh: EventEmitter<any> = new EventEmitter<any>();

  uiActions: any[]; // TODO add type !!!!

  private orderData: DetailInterface;
  private orderId: string = null;
  private businessId: string = null;
  private shippingLabelData: ShippingLabelInterface = null;
  private destroyed$: ReplaySubject<boolean> = new ReplaySubject(1);

  constructor(
    private apiService: ApiService,
    private activatedRoute: ActivatedRoute,
    private cdr: ChangeDetectorRef,
    private detailService: DetailService,
    private router: Router,
    private settingsService: SettingsService,
    private snackBarService: SnackBarService,
    private translateService: TranslateService
  ) {}

  ngOnInit(): void {
    this.activatedRoute.params.pipe(takeUntil(this.destroyed$)).subscribe((params: Params) => {
      this.orderId = params['orderId'];
      this.businessId = params['uuid'];
      this.prepareActionsForUI();
      this.cdr.detectChanges();

      if (this.order._shippingActions.find(a => ['download_shipping_label', 'download_return_label'].indexOf(a.action) >= 0)) {
        this.apiService.downloadLabel(this.businessId, this.orderData.shipping.order_id)
        .subscribe(
          (res: ShippingLabelInterface) => {
            // We have to request on init, because if we request on click - browser blocks popup
            this.shippingLabelData = res;
          },
          (err: HttpErrorResponse) => {
            this.handleError(err, true);
            this.detailService.loading = false;
          }
        );
      }
    });
  }

  ngOnDestroy(): void {
    this.destroyed$.next(true);
    this.destroyed$.complete();
  }

  get santanderContractUrl(): string {
    return this.settingsService.externalUrls['getSantanderContractUrl'](this.order.transaction.original_id);
  }

  get santanderFactoringContractUrl(): string {
    return this.settingsService.externalUrls['getSantanderFactoringContractUrl'](this.businessId, this.order.transaction.original_id);
  }

  get santanderInvoiceContractUrl(): string {
    return this.settingsService.externalUrls['getSantanderInvoiceContractUrl'](this.businessId, this.order.transaction.original_id);
  }

  get santanderDeQrUrl(): string {
    const customerAddress: AddressInterface = this.order.shipping.address;
    const billing_address: AddressInterface = this.order.billing_address;
    const paymentDetails: PaymentDetailsWithOrderInterface = this.order.details;
    let resultingUrl: string;
    if (paymentDetails.credit_answer) {
      const referenceNumber: string = this.parseReferenceNumber(paymentDetails.credit_answer);
      const firstName: string = customerAddress ? customerAddress.first_name : billing_address.first_name;
      const lastName: string = customerAddress ? customerAddress.last_name : billing_address.last_name;
      resultingUrl = this.settingsService.externalUrls['getSantanderDeQr'](firstName, lastName, referenceNumber);
    } else {
      resultingUrl = '';
    }
    return resultingUrl;
  }

  get showSantanderDeQr(): boolean {
    return Boolean(this.order)
      && Boolean(this.order._showSantanderDeQr)
      && Boolean(this.order.details.credit_answer);
  }

  onClickCheckStatusAction(): void {
    this.detailService.loading = true;
    this.apiService.checkSantanderStatus(this.orderId)
    .subscribe(
      () => this.refresh.emit(),
      (errorResponse: HttpErrorResponse) => {
        this.handleError(errorResponse.error, true);
        this.detailService.loading = false;
      }
    );
  }

  onClickOrderAction(action: ActionType): void {
    if (action) {
      this.router.navigate(
        [ 'action', action ],
        {
          queryParamsHandling: 'merge',
          relativeTo: this.activatedRoute
        }
      );
    }
  }

  onClickCreditAnswerAction(): void {
    this.router.navigate(
      ['action', 'credit_answer'],
      {
        queryParamsHandling: 'merge',
        relativeTo: this.activatedRoute
      }
    );
  }

  private prepareBillingAddressForPost(billingAddress: AddressInterface): ProcessShippingBillingAddressInterface {
    const streetName: string = billingAddress.street_name || this.extractStreetNameAndNumber(billingAddress.street)[0];
    const streetNumber: string = billingAddress.street_number || this.extractStreetNameAndNumber(billingAddress.street)[1];

    return {
      streetName,
      streetNumber,
      name: billingAddress.first_name,
      city: billingAddress.city,
      stateProvinceCode: billingAddress.stateProvinceCode,
      zipCode: this.order.billing_address.zip_code,
      countryCode: this.order.billing_address.country,
      phone: this.order.billing_address.phone
    };
  }

  private extractStreetNameAndNumber(street: string): string[] {
    const arr: string[] = street.split(' ');
    const last: string = arr.pop();
    if (arr.length > 0 && /\d/.test(last)) { // If last part has digits - last part is street number
      return [arr.join(' '), last];
    }
    return [street, ''];
  }

  private get actionsEnabled(): ActionInterface[] {
    return this.order.actions.filter((action: ActionInterface) => action.enabled);
  }

  private get shippingActionsEnabled(): ActionInterface[] {
    return this.order._shippingActions.filter((action: ActionInterface) => action.enabled);
  }

  private get mailerActionsEnabled(): MailActionInterface[] {
    return this.order._mailerActions.filter((action: MailActionInterface) => action.enabled);
  }

  private prepareActionsForUI(): void {
    if (!this.orderData) {
      return;
    }
    if (
      this.actionsEnabled.length ||
      this.shippingActionsEnabled.length ||
      this.mailerActionsEnabled.length ||
      this.order._showSantanderDeQr ||
      ['santander_pos_installment', 'santander_installment', 'santander_ccp_installment'].indexOf(this.order.payment_option.type) >= 0
    ) {
      const highPriorityActions: string[] = ['shipping_goods', 'return', 'refund'];
      const actionsSorted: ActionInterface[] = this.actionsEnabled
        .sort((actionA, actionB) => {
          return highPriorityActions.indexOf(actionB.action) - highPriorityActions.indexOf(actionA.action);
        });

      const uiActions: any[] = actionsSorted
        .map((action: ActionInterface) => {
          if (action.action === 'shipping_goods' && this.order.transaction.example) {
            // TODO This is tempodary solution for demo
            return {
              type: 'button',
              labelTranslated: action._label,
              onClick: (event: MouseEvent) => {
                if (this.order.shipping.example_label) {
                  this.onClickOrderAction(action.action);
                } else {
                  this.detailService.loading = true;
                  this.detailService.actionOrder(this.orderId, {}, 'shipping_goods', 'payment_shipping_goods', true, this.order.payment_option.type).subscribe(
                    (order: DetailInterface) => {
                      this.onClickOrderAction(action.action);
                      this.detailService.loading = false;
                    },
                    errorResponse => {
                      this.handleError(errorResponse.error, true);
                      this.detailService.loading = false;
                    }
                  );
                }
              },
            };
          }
          return {
            type: 'button',
            labelTranslated: action._label,
            onClick: (event: MouseEvent) => {
              this.onClickOrderAction(action.action);
            }
          };
        });

      if (this.showSantanderDeQr) {
        uiActions.unshift({
          type: 'link',
          href: this.santanderDeQrUrl,
          label: this.getActionLabel('create_label_ship')
        });
      }

      if (this.order._isSantander && !this.order._hideUpdateStatusAction && !this.order._isForceHideUpdateStatus) {
        uiActions.push({
          type: 'button',
          label: this.getActionLabel('check_status'),
          onClick: (event: MouseEvent) => {
            this.onClickCheckStatusAction();
          }
        });
      }

      if (this.showCreditAnswer) {
        uiActions.push({
          type: 'button',
          label: this.getActionLabel('credit_answer'),
          onClick: (event: MouseEvent) => {
            this.onClickCreditAnswerAction();
          }
        });
      }

      if (this.order._showSantanderContract) {
        uiActions.push({
          type: 'link',
          href: this.santanderContractUrl,
          label: this.getActionLabel('contract')
        });
      }
      if (this.order._showSantanderFactoringContract) {
        uiActions.push({
          type: 'link',
          href: this.santanderFactoringContractUrl,
          label: this.getActionLabel('contract')
        });
      }
      if (this.order._showSantanderInvoiceContract) {
        uiActions.push({
          type: 'link',
          href: this.santanderInvoiceContractUrl,
          label: this.getActionLabel('contract')
        });
      }

      if (this.order._shippingActions) {
        forEach(this.order._shippingActions, action => {
          uiActions.push({
             type: 'button',
             onClick: (event: MouseEvent) => {
               this.onClickOrderShippingAction(action);
             },
             label: this.getActionLabel(action.action)
           });
        });
      }
      if (this.order._mailerActions) {
        forEach(this.order._mailerActions, action => {
          uiActions.push({
             type: 'button',
             onClick: (event: MouseEvent) => {
               this.onClickOrderMailerAction(action);
             },
             label: this.getActionLabel(action.action)
           });
        });
      }
      this.uiActions = uiActions;
    }
  }

  private onClickOrderShippingAction(order: ActionInterface): void {
    if (order.action === 'download_shipping_slip') {
      this.router.navigate(['action', this.orderData.shipping.order_id, 'download_shipping_slip'], {
        relativeTo: this.activatedRoute
      });
    }
    if (order.action === 'download_shipping_label' && this.shippingLabelData) {
      window.open(this.shippingLabelData.label, '__blank');
    }
    if (order.action === 'download_return_label' && this.shippingLabelData) {
      window.open(this.shippingLabelData.returnLabel, '__blank');
    }
    if (order.action === 'process_shipping_order') {
      this.detailService.loading = true;
      this.apiService.getBusinessData().subscribe(business => {
        const billingAddress: ProcessShippingBillingAddressInterface = this.prepareBillingAddressForPost(this.order.billing_address);
        const order: ProcessShippingOrderInterface = {
          businessName: business.name,
          transactionId: this.order.transaction.uuid,
          transactionDate: this.order.transaction.created_at,
          legalText: `${business.name} ${billingAddress.streetName} ${billingAddress.streetNumber}`,
          billingAddress,
          shipmentDate: moment().format('YYYY-MM-DD')
        };
        this.apiService.processShippingOrder(order, this.order.shipping.order_id)
        .subscribe(
          () => {
            this.detailService.loading = false;
          },
          (err: HttpErrorResponse) => {
            this.handleError(err, true);
            this.detailService.loading = false;
          }
        );
      });
    }
  }

  private onClickOrderMailerAction(order: MailActionInterface): void {
    if (order.action === 'resend_shipping_order_template') {
      this.detailService.loading = true;
      this.apiService.resendShippingConfirmation(this.settingsService.businessUuid, order.mailEvent.id)
      .subscribe(
        () => {
          this.detailService.loading = false;
        },
        (err: HttpErrorResponse) => {
          this.handleError(err, true);
          this.detailService.loading = false;
        }
      );
    }
  }

  private get showCreditAnswer(): boolean {
    return this.order ? this.order._showCreditAnswer && SHOW_CREDIT_ANSWER_TYPES.indexOf(this.order.payment_option.type) >= 0 : true;
  }

  private getActionLabel(action: string): string {
    const labelPayment: string = `details.actions.${this.order.payment_option.type}.${action}`;
    const labelDefault: string = `actions.${action}`;

    return this.translateService.hasTranslation(labelPayment) ? labelPayment : labelDefault;
  }

  private parseReferenceNumber(creditAnswer: string): string {
    const matchedValue: RegExpMatchArray = creditAnswer.match( /Referenznummer:\s+[0-9]*/);
    return matchedValue ? matchedValue[0].replace( /^\D+/g, '') : '';
  }

  private handleError(error: any, showSnack?: boolean): void {
    if (!error.message) {
      error.message = this.translateService.translate('errors.error');
    }
    if (error.status === 403 || error.statusCode === 403 || error.code === 403) {
      error.message = this.translateService.translate('errors.forbidden');
    }
    if (showSnack) {
      this.showError(error.message);
    }
  }

  private showError(error: string): void {
    this.snackBarService.toggle(true, error || 'Unknown error', {
      duration: 5000,
      iconId: 'icon-alert-24',
      iconSize: 24
    });
  }

}
