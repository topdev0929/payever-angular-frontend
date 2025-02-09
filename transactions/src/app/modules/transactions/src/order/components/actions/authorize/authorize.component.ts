import { AfterContentChecked, Component, ElementRef, Inject, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { ReplaySubject, Subject } from 'rxjs';

import { DATE_FORMAT_SHORT, LANG, TranslateService } from '@pe/ng-kit/modules/i18n';

import { DetailInterface, ErrorsFormInterface, ErrorFormControlInterface, ActionType } from '../../../../shared';
import { DetailService } from '../../../services';
import { DateFormatPipe } from '../../../../shared';

declare const $: any;

@Component({
  selector: 'or-action-authorize',
  templateUrl: 'authorize.component.html',
  styleUrls: ['./authorize.component.scss'],
  host: {class: 'transactions-valigned-modal'}
})
export class ActionAuthorizeComponent implements AfterContentChecked, OnDestroy, OnInit {

  loading: boolean = false;

  modalButtons: any[] = [{
    onClick: () => this.onSubmit()
  }];

  form: FormGroup = null;
  error: string = null;
  order: DetailInterface = {} as any;

  close$: Subject<void> = new Subject<void>();

  @ViewChild('invoiceDateInput') invoiceDateInput: ElementRef;

  private action: ActionType = null;
  private orderId: string;
  private businessUuid: string;
  private destroyed$: ReplaySubject<boolean> = new ReplaySubject(1);

  constructor(
    private activatedRoute: ActivatedRoute,
    private detailService: DetailService,
    private formBuilder: FormBuilder,
    private translateService: TranslateService,
    private dateFormat: DateFormatPipe,
    @Inject(DATE_FORMAT_SHORT) private dateFormatShort: string,
    @Inject(LANG) private lang: string
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

  ngAfterContentChecked(): void {
    if (this.invoiceDateInput) {
      this.initDatepicker();
    }
  }

  get currentDate(): string {
    return this.dateFormat.transform(null, {format: this.dateFormatShort.toUpperCase()});
  }

  onSubmit(): void {
    this.loading = true;
    if ( this.error ) {
      // this.modalService.hideModal();
    }
    else {
      // this.modalService.loading = true;
      const dataKey: string = this.order._isPaymill || this.order._isPayex || this.order._isSwedbank ? 'payment_authorize' : 'transfer';
      this.detailService.actionOrder(this.orderId, this.form.value, 'authorize', dataKey, false, this.order.payment_option.type).subscribe(
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
        if ( order._isPaymill ) {
          this.modalButtons[0].title = this.translateService.translate('form.charge.actions.charge');
        }
        else {
          this.modalButtons[0].title = this.translateService.translate('form.invoice.actions.transfer');
        }
        this.order = order;
        this.createForm();
      }
    );
  }

  private createForm(): void {
    if ( this.order._isPaymill || this.order._isPayex || this.order._isSwedbank ) {
      this.form = this.formBuilder.group({});
    } else {
      this.form = this.formBuilder.group({
        invoiceDate: this.dateFormat.transform(null, { format: 'MM/DD/YYYY' }),
        invoiceId: this.orderId,
        customerId: this.order.customer.email
      });
    }
  }

  private initDatepicker(): void {
    const $element: any = $(this.invoiceDateInput.nativeElement);
    if ( !$element.hasClass('has-datepicker') ) {
      $element.addClass('has-datepicker').datepicker({
        language: this.lang,
        autoclose: true,
        disableTouchKeyboard: true,
        container: 'body',
        startView: 0,
        format: this.dateFormatShort,
        endDate: '0d',
        orientation: 'bottom left'
      }).on('changeDate', () => this.onChangeDate());
    }
  }

  private onChangeDate(): void {
    this.form.get('invoiceDate').setValue(this.dateFormat.transform(this.invoiceDateInput.nativeElement.value, { format: 'MM/DD/YYYY' }));
  }

}
