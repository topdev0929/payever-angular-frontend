import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { ReplaySubject, Subject } from 'rxjs';

import { TranslateService } from '@pe/ng-kit/modules/i18n';

import { ActionRequestInterface, DetailInterface, ErrorsFormInterface, ActionType } from '../../../../shared';
import { DetailService } from '../../../services';

@Component({
  selector: 'or-action-change-reference',
  templateUrl: 'change-reference.component.html',
  styleUrls: ['./change-reference.component.scss'],
  host: {class: 'transactions-valigned-modal'}
})
export class ActionChangeReferenceComponent implements OnDestroy, OnInit {

  loading: boolean = false;

  modalButtons: any[] = [{
    title: this.translateService.translate('form.change_reference.actions.change'),
    onClick: () => this.onSubmit()
  }];

  currencySymbol: string = '';
  form: FormGroup = null;
  error: string = null;

  close$: Subject<void> = new Subject<void>();

  private initialReference: number = null;
  private action: ActionType = null;
  private orderId: string;
  private businessUuid: string;

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
    const reference: number = this.form.get('reference').value;
    if (String(reference) === '') {
      this.form.get('reference').setErrors(this.translateService.translate('form.change_reference.errors.must_be_not_empty') as any);
    } else {
      this.loading = true;
      this.detailService.actionOrder(this.orderId, reference as any, 'edit', 'reference', false, this.order.payment_option.type).subscribe(
        () => this.close$.next(),
        (response: Response) => {
          this.loading = false;
        }
      );
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
    this.initialReference = Number(this.order.details.order.reference);

    this.form = this.formBuilder.group({
      reference: this.order.details.order.reference
    });
  }
}
