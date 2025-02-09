import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { ReplaySubject, Subject } from 'rxjs';

import { TranslateService } from '@pe/ng-kit/modules/i18n';

import { ActionRequestInterface, DetailInterface, ErrorsFormInterface, ActionType } from '../../../../shared';
import { DetailService } from '../../../services';

@Component({
  selector: 'or-action-remind',
  templateUrl: 'remind.component.html',
  styleUrls: ['./remind.component.scss'],
  host: {class: 'transactions-valigned-modal'}
})
export class ActionRemindComponent implements OnDestroy, OnInit {

  loading: boolean = false;

  modalButtons: any[] = [{
    title: this.translateService.translate('form.remind.actions.remind'),
    onClick: () => this.onSubmit()
  }];

  currencySymbol: string = '';
  form: FormGroup = null;

  close$: Subject<void> = new Subject<void>();

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
    this.loading = true;
    const data: ActionRequestInterface = {};
    const dunningCosts: number = this.form.get('dunningCosts').value;
    if ( dunningCosts ) {
      data.dunningCosts = dunningCosts;
    }
    this.detailService.actionOrder(this.orderId, data, 'remind', 'payment_reminder', false, this.order.payment_option.type).subscribe(
      () => this.close$.next(),
      (errors: Response) => {
        this.loading = false;
      }
    );
  }

  private getData(): void {
    this.detailService.getData(this.businessUuid, this.orderId).subscribe(
      (order: DetailInterface): void => {
        this.order = order;
        // this.businessService.getBusinessCurrencies(this.settingsService.businessSlug, this.settingsService.settings.apiRestUrlPrefix()).subscribe(
        //   (currencies: BusinessCurrencyInterface[]) => {
        //     this.currencySymbol = currencies.find((currency: BusinessCurrencyInterface) => currency.code === this.order.transaction.currency).symbol;
        //   }
        // );
        this.createForm();
      }
    );
  }

  private createForm(): void {
    this.form = this.formBuilder.group({
      dunningCosts: ''
    });
  }

}
