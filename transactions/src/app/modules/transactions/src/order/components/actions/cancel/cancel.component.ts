import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ReplaySubject, Subject } from 'rxjs';

import { TranslateService } from '@pe/ng-kit/modules/i18n';

import { ActionRequestInterface, DetailInterface, ErrorsFormInterface, ActionType } from '../../../../shared';
import { DetailService } from '../../../services';
import { SettingsService } from '../../../../shared';

@Component({
  selector: 'or-action-cancel',
  templateUrl: 'cancel.component.html',
  styleUrls: ['./cancel.component.scss'],
  host: {class: 'transactions-valigned-modal'}
})
export class ActionCancelComponent implements OnDestroy, OnInit {

  loading: boolean = false;

  modalButtons: any[] = [{
    title: this.translateService.translate('form.cancel.actions.cancel'),
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
    private router: Router,
    private settingsService: SettingsService,
    private translateService: TranslateService
  ) {}

  ngOnDestroy(): void {
    this.destroyed$.next(true);
    this.destroyed$.complete();
  }

  ngOnInit(): void {
    this.settingsService.businessUuid = this.activatedRoute.snapshot.params['uuid'];
    this.action = this.activatedRoute.snapshot.data['action'];
    this.orderId = this.activatedRoute.snapshot.params['orderId'];
    this.businessUuid = this.activatedRoute.snapshot.params['uuid'];

    this.getData();
  }

  onSubmit(): void {
    this.loading = true;
    if ( this.error ) {
      // this.modalService.hideModal();
    }
    else {
      // this.modalService.loading = true;
      const data: ActionRequestInterface = {};
      const reason: string = this.form.get('reason').value;
      if ( reason ) {
        data.reason = reason;
      }
      if (this.form.get('amount') && this.form.get('amount').value) {
        data.amount = this.form.get('amount').value;
      }
      this.detailService.actionOrder(this.orderId, data, 'cancel', 'payment_cancel', false, this.order.payment_option.type).subscribe(
        () => this.close$.next(),
        (errors: Response) => {
          this.loading = false;
        }
      );
    }
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
    const controlsConfig: { [propName: string]: string } = this.order.payment_option.type === 'santander_installment_no'
      ? { reason: '', amount: '' }
      : { reason: '' };
    this.form = this.formBuilder.group(controlsConfig);
  }
  //
  // private showValidationErrors(errors: ErrorsFormInterface): void {
  //   if ( errors.children && errors.children['reason'] && errors.children['reason'].errors ) {
  //     this.form.controls['reason'].setErrors(errors.children['reason'].errors);
  //   }
  //   if ( errors.error ) {
  //     this.error = errors.error;
  //     this.form.get('reason').disable();
  //   }
  //   this.modalService.loading = false;
  // }

}
