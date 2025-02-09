import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { ReplaySubject, Subject } from 'rxjs';

import { TranslateService } from '@pe/ng-kit/modules/i18n';

import { DetailInterface, ActionType, ActionRequestInterface } from '../../../../shared';
import { DetailService } from '../../../services';

@Component({
  selector: 'or-action-paid',
  templateUrl: 'paid.component.html',
  styleUrls: ['./paid.component.scss'],
  host: {class: 'transactions-valigned-modal'}
})
export class ActionPaidComponent implements OnDestroy, OnInit {

  loading: boolean = false;

  modalButtons: any[] = [{
    title: this.translateService.translate('form.paid.actions.confirm'),
    onClick: () => this.onSubmit()
  }];

  form: FormGroup = null;

  close$: Subject<void> = new Subject<void>();

  private action: ActionType = null;
  private orderId: string;
  private businessUuid: string;

  private order: DetailInterface = null;
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
    const status: string = this.form.get('status').value;
    if ( status ) {
      data.status = status;
    }
    this.detailService.actionOrder(this.orderId, data, 'paid', 'payment_paid', false, this.order.payment_option.type).subscribe(
      () => this.close$.next(),
      (errors: Response) => {
        this.loading = false;
      }
    );
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
      status: 'STATUS_PAID'
    });
  }

}
