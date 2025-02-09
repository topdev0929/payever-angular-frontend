import { ChangeDetectorRef, Component, Inject, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { ReplaySubject, Subject } from 'rxjs';
import { forEach } from 'lodash-es';

import { PaymentMethodEnum } from '@pe/checkout-sdk/sdk/types';

import { TranslateService } from '@pe/ng-kit/modules/i18n';
import { AddressService } from '@pe/ng-kit/modules/address';
import { FORM_DATE_ADAPTER } from '@pe/ng-kit/src/kit/form-core/constants/date-adapter'; // TODO Fix in ng-kit and replace src/kit to modules
import { DateAdapterInterface } from '@pe/ng-kit/modules/form';

import { ActionModalButtonInterface, DetailInterface, ActionType, PaymentType } from '../../../../shared';
import { DetailService } from '../../../services';

@Component({
  selector: 'or-action-verify',
  templateUrl: 'verify.component.html',
  styleUrls: ['./verify.component.scss'],
  host: {class: 'transactions-valigned-modal'}
})
export class ActionVerifyComponent implements OnDestroy, OnInit {

  error: string = null;
  loading: boolean = false;

  modalButtons: ActionModalButtonInterface[] = [];

  modalButtonsApprove: ActionModalButtonInterface[] = [{
    title: this.translateService.translate('form.verify.actions.verify'),
    onClick: () => this.verifyApprove(),
    disabled: false,
    class: 'success'
  }];
  modalButtonsDecline: ActionModalButtonInterface[] = [{
    title: this.translateService.translate('form.verify.actions.decline'),
    onClick: () => this.verifyDecline(),
    disabled: false,
    class: 'cancel'
  }];

  form: FormGroup = null;
  close$: Subject<void> = new Subject<void>();

  order: DetailInterface = null;

  private action: ActionType = null;
  private orderId: string;
  private businessUuid: string;
  private destroyed$: ReplaySubject<boolean> = new ReplaySubject(1);

  constructor(
    private activatedRoute: ActivatedRoute,
    private addressService: AddressService,
    private changeDetectorRef: ChangeDetectorRef,
    private detailService: DetailService,
    private formBuilder: FormBuilder,
    private translateService: TranslateService,
    @Inject(FORM_DATE_ADAPTER) protected dateAdapter: DateAdapterInterface
  ) {}

  get isShowSignedField(): boolean {
    return this.order && this.order.payment_option &&
           [PaymentMethodEnum.SANTANDER_POS_INVOICE_DE].indexOf(this.order.payment_option.type) < 0;
  }

  ngOnDestroy(): void {
    this.destroyed$.next(true);
    this.destroyed$.complete();
  }

  ngOnInit(): void {
    this.action = this.activatedRoute.snapshot.data['action'];
    this.orderId = this.activatedRoute.snapshot.params['orderId'];
    this.businessUuid = this.activatedRoute.snapshot.params['uuid'];

    this.getData();
  }

  verifyApprove(): void {
    this.verify(true);
  }

  verifyDecline(): void {
    this.verify(false);
  }

  verify(approved: boolean): void {
    if (this.validate()) {
      this.loading = true;
      this.changeDetectorRef.detectChanges();
      this.detailService.actionOrder(this.orderId, approved as any, 'verify', 'approved', false, this.order.payment_option.type).subscribe(
        () => this.close$.next(),
        () => {
          this.loading = false;
          this.error = this.translateService.translate('form.verify.errors.unknown');
          this.changeDetectorRef.detectChanges();
        }
      );
    }
  }

  validate(): boolean {
    this.error = null;
    return true;
  }

  get birthday(): string {
    const date: Date =  this.order.details && this.order.details['birthday'] ? this.dateAdapter.parse(this.order.details['birthday']) : null;
    return date ? this.dateAdapter.format(date) : null;
  }

  get billingAddressName(): string {
    return this.addressService.getNameString(this.order.billing_address);
  }

  get billingAddressLine(): string {
    return this.addressService.getAddressString(this.order.billing_address);
  }

  private getData(): void {
    this.detailService.getData(this.businessUuid, this.orderId).subscribe(
      (order: DetailInterface) => {
        this.order = order;
        this.createForm();
      }
    );
  }

  private createForm(): void {
    this.form = this.formBuilder.group({
      confirm: false,
      signed: false
    });
    this.form.valueChanges.subscribe(value => {
      const yes: boolean = this.isShowSignedField ? value['confirm'] && value['signed'] : value['confirm'];
      forEach(this.modalButtonsApprove, b => b.disabled = !yes);
      this.modalButtons = [...this.modalButtonsApprove, ...this.modalButtonsDecline];
    });
    this.form.controls['confirm'].setValue(false);
    this.form.controls['signed'].setValue(false);
  }

}
