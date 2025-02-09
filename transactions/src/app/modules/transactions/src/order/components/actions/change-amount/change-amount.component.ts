import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { ReplaySubject, Subject } from 'rxjs';

import { TranslateService } from '@pe/ng-kit/modules/i18n';

import { ActionRequestInterface, DetailInterface, ErrorsFormInterface, ActionType } from '../../../../shared';
import { DetailService } from '../../../services';

@Component({
  selector: 'or-action-change-amount',
  templateUrl: 'change-amount.component.html',
  styleUrls: ['./change-amount.component.scss'],
  host: {class: 'transactions-valigned-modal'}
})
export class ActionChangeAmountComponent implements OnDestroy, OnInit {

  loading: boolean = false;

  modalButtons: any[] = [{
    title: this.translateService.translate('form.change_amount.actions.change'),
    onClick: () => this.onSubmit()
  }];

  currencySymbol: string = '';
  form: FormGroup = null;
  error: string = null;

  close$: Subject<void> = new Subject<void>();

  private initialAmount: number = null;
  private action: ActionType = null;
  private orderId: string;
  private businessUuid: string;

  private editMode: boolean = false;
  private increaseAmountDisabled: boolean = false;

  private order: DetailInterface = {} as any;
  private destroyed$: ReplaySubject<boolean> = new ReplaySubject(1);

  constructor(
    private activatedRoute: ActivatedRoute,
    private detailService: DetailService,
    private formBuilder: FormBuilder,
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

    this.getData();
  }

  onSubmit(): void {
    const amount: number = this.form.get('amount').value;
    if (String(amount) === '' || amount <= 0) {
      this.form.get('amount').setErrors(this.translateService.translate('form.change_amount.errors.must_be_positibe_number') as any);
    } else if (this.increaseAmountDisabled && this.initialAmount && amount >= this.initialAmount) {
      this.form.get('amount').setErrors(this.translateService.translate('form.change_amount.errors.must_be_less_than', { amount: this.initialAmount }) as any);
    } else {
      this.loading = true;
      if (this.editMode) {
        this.detailService.actionOrder(this.orderId, amount as any, 'edit', 'amount', false, this.order.payment_option.type).subscribe(
          () => this.close$.next(),
          (response: Response) => {
            this.loading = false;
          }
        );
      } else {
        const data: ActionRequestInterface = {};
        if (amount) {
          data.amount = amount;
        }
        this.detailService.actionOrder(this.orderId, data, 'change_amount', 'payment_change_amount', false, this.order.payment_option.type).subscribe(
          () => this.close$.next(),
          (response: Response) => {
            this.loading = false;
          }
        );
      }
    }
  }

  private getData(): void {
    this.detailService.getData(this.businessUuid, this.orderId).subscribe(
      (order: DetailInterface): void => {
        this.order = order;
        // TODO: need to obtain the proper currencies
        // this.businessService.getBusinessCurrencies(this.settingsService.businessUuid, this.settingsService.settings.apiRestUrlPrefix()).subscribe(
        //   (currencies: BusinessCurrencyInterface[]) => {
        //     this.currencySymbol = currencies.find((currency: BusinessCurrencyInterface) => currency.code === this.order.transaction.currency).symbol;
        //   }
        // );
        this.createForm();
      }
    );
  }

  private createForm(): void {
    this.initialAmount = Number(this.order.transaction.amount);

    if (this.order._isSantanderPosDeFactInvoice || this.order._isSantanderNo) {
      this.editMode = true;
    }
    this.increaseAmountDisabled = this.order._isSantanderPosDeFactInvoice;

    this.form = this.formBuilder.group({
      amount: this.order.transaction.amount
    });
  }

  // private showValidationErrors(errors: ErrorsFormInterface): void {
  //   if ( errors.children && errors.children['amount'] && errors.children['amount'].errors ) {
  //     this.form.controls['amount'].setErrors(errors.children['amount'].errors);
  //   }
  //   if ( errors.error ) {
  //     this.error = errors.error;
  //     this.form.get('amount').disable();
  //   }
  //   this.modalService.loading = false;
  // }

}
