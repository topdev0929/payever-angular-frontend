import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormArray, FormBuilder, FormGroup } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { ReplaySubject, Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { isArray, round } from 'lodash-es';

import { TranslateService } from '@pe/ng-kit/modules/i18n';
import { WindowService } from '@pe/ng-kit/modules/window';

import {
  ActionRequestInterface,
  ActionRequestUpdateDataInterface,
  BusinessVatInterface,
  DetailInterface,
  ItemInterface,
  ActionType,
  ApiService
} from '../../../../shared';
import { DetailService } from '../../../services';

import { businessVatsMock } from '../../../../shared/mocks';

@Component({
  selector: 'or-action-update',
  templateUrl: 'update.component.html',
  styleUrls: ['./update.component.scss'],
  host: {class: 'transactions-valigned-modal'}
})
export class ActionUpdateComponent implements OnDestroy, OnInit {

  loading: boolean = false;

  modalButtons: any[] = [{
    title: this.translateService.translate('form.update.actions.update'),
    onClick: () => this.onSubmit()
  }];

  businessVat: BusinessVatInterface[] = [];
  calculatedTotal: number = null;
  isMobile: boolean = false;
  form: FormGroup = null;
  validationError: string = null;
  order: DetailInterface = null;

  close$: Subject<void> = new Subject<void>();

  private action: ActionType = null;
  private orderId: string;
  private businessUuid: string;

  private destroyed$: ReplaySubject<boolean> = new ReplaySubject(1);

  constructor(
    private apiService: ApiService,
    private activatedRoute: ActivatedRoute,
    private detailService: DetailService,
    private formBuilder: FormBuilder,
    private peWindowService: WindowService,
    private translateService: TranslateService
  ) {}

  ngOnDestroy(): void {
    this.destroyed$.next(true);
    this.destroyed$.complete();
  }

  ngOnInit(): void {
    this.action = this.activatedRoute.snapshot.data['action'];
    this.orderId = this.activatedRoute.snapshot.params['orderId'];
    this.businessUuid = this.activatedRoute.snapshot.params['uuid'];

    this.peWindowService.isMobile$.pipe(
      takeUntil(this.destroyed$))
      .subscribe((isMobile: boolean) => this.isMobile = isMobile);

    this.getBusinessVat();
  }

  get deliveryFeeMax(): number {
    return +this.order.transaction.total;
  }

  get calculatedTotalError(): number {
    if (this.order && this.order._isSantanderNoInvoice) {
      return 0;
    }
    const calculatedTotalError: number = this.calculatedTotal ? round((this.calculatedTotal - (+this.order.transaction.total)), 2) : 0;
    this.setValidationError(calculatedTotalError);
    return calculatedTotalError;
  }

  get productLine(): FormArray {
    return this.form.get('updateData').get('productLine') as FormArray;
  }

  onClickAddItem(event: Event): void {
    this.productLine.push(this.createFormItemGroup());
    event.preventDefault();
  }

  onClickRemoveItem(index: number): void {
    this.productLine.removeAt(index);
  }

  vatRateValue(vatRate: BusinessVatInterface): string {
    return `${vatRate.country}: ${vatRate.value}%`;
  }

  onSubmit(): void {
    this.loading = true;
    const formValue: ActionRequestInterface = this.form.value;
    /*
    const data: ActionRequestInterface = { updateData: {} };
    const reason: string = formValue.reason;
    const deliveryFee: string = formValue.updateData.deliveryFee.toString();
    const productLine: ItemInterface[] = formValue.updateData.productLine;
    if ( reason ) {
      data.reason = reason;
    }
    if ( deliveryFee ) {
      data.updateData.deliveryFee = deliveryFee;
    }
    if ( productLine.length ) {
      data.updateData.productLine = productLine;
    }
    this.validationError = null;
    this.detailService.actionOrder(this.orderId, data, this.action, 'payment_update', false, this.order.payment_option.type)
      .subscribe(
        () => this.close$.next(),
        (error: Response) => {
          this.loading = false;
        }
      );*/
    if (this.order._isSantanderNoInvoice && this.action === 'edit') {
      const data: any = {};
      data.reason = formValue.reason;
      data.delivery_fee = this.stringify(formValue.updateData.deliveryFee);
      data.payment_items = formValue.updateData.productLine;
      this.validationError = null;
      this.detailService.actionOrder(
        this.orderId, data, 'edit', null, false, this.order.payment_option.type
      ).subscribe(() => this.close$.next(), (error: Response) => {
        if (error.status === 404) {
          this.showValidationErrors(error);
        } else {
          this.showValidationErrors(error.json());
        }

        this.loading = false;
      });
    } else {
      const data: ActionRequestInterface = { updateData: {} };
      const reason: string = formValue.reason;
      const deliveryFee: string = this.stringify(formValue.updateData.deliveryFee);
      const productLine: ItemInterface[] = formValue.updateData.productLine;
      if ( reason ) {
        data.reason = reason;
      }
      if ( deliveryFee ) {
        data.updateData.deliveryFee = deliveryFee;
      }
      if ( productLine.length ) {
        data.updateData.productLine = productLine;
      }
      this.validationError = null;
      this.detailService.actionOrder(
        this.orderId, data, 'edit' || this.action, 'payment_update', false, this.order.payment_option.type
      ).subscribe(() => this.close$.next(), (error: Response) => {
        if (error.status === 404) {
          this.showValidationErrors(error);
        } else {
          this.showValidationErrors(error.json());
        }

        this.loading = false;
      });
    }
  }

  getData(): void {
    this.detailService.getData(this.businessUuid, this.orderId).subscribe((order: DetailInterface): void => {
      this.order = order;
      this.createForm();
    });
  }

  private stringify(data: any): string {
    return data ? data.toString(): '';
  }

  private getBusinessVat(): void {
    this.apiService.getBusinessData().subscribe(businessData => { // TODO Get via ngrx
      this.businessVat = businessVatsMock.filter(elem => elem.country === businessData.companyAddress.country);
      this.getData();
    });
  }

  private createFormItemGroup(productItem?: ItemInterface): FormGroup {
    const item: ItemInterface = productItem || {} as any;
    return this.formBuilder.group({
      vat_rate: item.vat_rate ? parseFloat(item.vat_rate.toString()).toFixed(2) : '',
      name: item.name || '',
      description: item.description || '',
      identifier: item.identifier || '',
      price: item.price || '',
      quantity: item.quantity || ''
    });
  }

  private createForm(): void {
    const productLineFormGroup: FormGroup[] = this.order.cart.items.map((item: ItemInterface) => this.createFormItemGroup(item));
    const productLineFormArray: FormArray = this.formBuilder.array(productLineFormGroup);
    this.form = this.formBuilder.group({
      updateData: this.formBuilder.group({
        deliveryFee: +this.order.shipping.delivery_fee || parseFloat(String(this.order.shipping.delivery_fee)) || '',
        productLine: productLineFormArray
      }),
      reason: ''
    });
    this.form.get('updateData').valueChanges.subscribe(() => this.onChangeUpdateData());
  }

  private onChangeUpdateData(): void {
    const updateData: ActionRequestUpdateDataInterface = this.form.get('updateData').value;
    let calculatedTotal: number = +updateData.deliveryFee;
    updateData.productLine.forEach((item: ItemInterface) => {
      const sub: number = ((+item.price) * (+item.quantity));
      const tax: number = (+item.vat_rate || 0) / 100;
      calculatedTotal += sub + sub * tax;
    });
    this.calculatedTotal = calculatedTotal;
  }

  private setValidationError(calculatedTotalError: number): void {
    if (calculatedTotalError !== 0) {
      for (const formGroup of this.productLine.controls) {
        formGroup.setErrors({
          price: this.translateService.translate(`form.update.errors.price.${calculatedTotalError > 0 ? 'big' : 'small'}`)
        });
      }
    }
    else if (this.form) {
      for (const formGroup of this.productLine.controls) {
        formGroup.updateValueAndValidity();
      }
    }
  }

  private showValidationErrors(error: any): void {
    if (error && error.errors) {
      if (error.errors.message) {
        this.validationError = `${error.errors.message}: `;
      }
      if (isArray(error.errors.errors)) {
        this.validationError += error.errors.errors.join(', ');
      }
    }
    if (error && error.error && error.error.message) {
      this.validationError = `${error.error.message}`;
    }
    this.loading = false;
  }

}
