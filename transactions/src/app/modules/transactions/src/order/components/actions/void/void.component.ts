import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ReplaySubject, Subject } from 'rxjs';

import { TranslateService } from '@pe/ng-kit/modules/i18n';

import { ActionType, DetailInterface } from '../../../../shared';
import { DetailService } from '../../../services';

@Component({
  selector: 'or-action-void',
  templateUrl: 'void.component.html',
  host: {class: 'transactions-valigned-modal'}
})
export class ActionVoidComponent implements OnDestroy, OnInit {

  loading: boolean = false;

  modalButtons: any[] = [{
    title: this.translateService.translate('actions.confirm'),
    onClick: () => this.onSubmit()
  }];

  error: string = null;

  close$: Subject<void> = new Subject<void>();

  private action: ActionType = null;
  private orderId: string;
  private businessUuid: string;

  private order: DetailInterface = {} as any;
  private destroyed$: ReplaySubject<boolean> = new ReplaySubject(1);

  constructor(
    private activatedRoute: ActivatedRoute,
    private detailService: DetailService,
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
    this.detailService.actionOrder(this.orderId, {}, 'void', 'payment_void', false, this.order.payment_option.type).subscribe(
      () => this.close$.next(),
      () => {
        this.error = this.translateService.translate('errors.error');
        this.loading = false;
      }
    );
  }

  private getData(): void {
    this.detailService.getData(this.businessUuid, this.orderId).subscribe(
      (order: DetailInterface): void => {
        this.order = order;
      }
    );
  }

}
