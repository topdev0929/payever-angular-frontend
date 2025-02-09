import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { ReplaySubject, Subject } from 'rxjs';

import { TranslateService } from '@pe/ng-kit/modules/i18n';

import { ActionRequestInterface, ActionType, DetailInterface, ErrorsFormInterface } from '../../../../shared';
import { DetailService } from '../../../services';

@Component({
  selector: 'or-action-capture',
  templateUrl: 'capture.component.html',
  styleUrls: ['./capture.component.scss'],
  host: {class: 'transactions-valigned-modal'}
})
export class ActionCaptureComponent implements OnDestroy, OnInit {

  loading: boolean = false;

  modalButtons: any[] = [{
    title: this.translateService.translate('form.capture.actions.capture'),
    onClick: () => this.onSubmit()
  }];

  form: FormGroup = null;
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
    const amount: number = this.form.get('amount').value;
    if (amount) {
      data.amount = amount;
    }
    this.detailService.actionOrder(this.orderId, data, 'capture', 'capture_funds', false, this.order.payment_option.type)
      .subscribe(
        () => this.close$.next(),
        (errors: any) => {
          if (errors.error && errors.error.message) {
            this.error = errors.error.message;
          } else {
            this.error = 'Unknown error'; // TODO Translate
          }
          this.loading = false;
        }
      );
  }

  private getData(): void {
    this.detailService.getData(this.businessUuid, this.orderId).subscribe(
      (order: DetailInterface): void => {
        this.order = order;
        this.createForm();
      }
    );
  }

  private createForm(): void {
    this.form = this.formBuilder.group({
      amount: ''
    });
  }

  // private showValidationErrors(errors: ErrorsFormInterface): void {
  //   if ( errors.children && errors.children['amount'] && errors.children['amount'].errors ) {
  //     this.form.controls['amount'].setErrors(errors.children['amount'].errors);
  //   }
  //   if ( errors.error ) {
  //     this.error = errors.error;
  //   }
  //   this.modalService.loading = false;
  // }

}
