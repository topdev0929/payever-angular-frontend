import { CurrencyPipe } from '@angular/common';
import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  EventEmitter,
  Injector,
  Input,
  OnInit,
  Output,
  ViewChild,
} from '@angular/core';
import { FormBuilder, FormGroupDirective, Validators } from '@angular/forms';
import { SelectSnapshot } from '@ngxs-labs/select-snapshot';
import { Actions, Store, ofActionCompleted, ofActionDispatched } from '@ngxs/store';
import { Subject, merge } from 'rxjs';
import { map, takeUntil, tap } from 'rxjs/operators';

import { AnalyticFormStatusEnum, AnalyticsFormService } from '@pe/checkout/analytics';
import { TrackingService } from '@pe/checkout/api';
import { ModeEnum } from '@pe/checkout/form-utils';
import { NodeFlowService } from '@pe/checkout/node-api';
import {
  FlowState,
  OpenNextStep,
  OpenNextStepFail,
  OpenNextStepSuccess,
  PatchFormState,
  PaymentState,
} from '@pe/checkout/store';
import {
  FlowInterface,
  PaymentMethodEnum,
  PaymentSpecificStatusEnum,
} from '@pe/checkout/types';
import { CustomElementService } from '@pe/checkout/utils';
import { PeDestroyService } from '@pe/destroy';

import { FormInterface, SantanderNoFlowService, NodePaymentResponseDetailsInterface } from '../../../../shared';

const ANALYTICS_FORM_NAME = 'FORM_PAYMENT_DETAILS';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'santander-no-details-form',
  providers: [CurrencyPipe],
  templateUrl: './details-form.component.html',
})
export class DetailsFormComponent implements OnInit {

  @SelectSnapshot(FlowState.flow) public flow: FlowInterface;

  @SelectSnapshot(FlowState.paymentMethod) public paymentMethod!: PaymentMethodEnum;

  @ViewChild(FormGroupDirective) private formGroupDirective: FormGroupDirective;

  @Input() mode: ModeEnum;
  @Input() submit$: Subject<void>;

  @Output() submitted = new EventEmitter<FormInterface>();

  public readonly modeEnum = ModeEnum;

  protected destroy$ = this.injector.get(PeDestroyService);
  protected santanderNoFlowService = this.injector.get(SantanderNoFlowService);
  protected nodeFlowService = this.injector.get(NodeFlowService);
  protected customElementService = this.injector.get(CustomElementService);

  private response = this.store.selectSnapshot(PaymentState.response);
  private paymentStatus = this.response.payment.specificStatus;

  private isAmlEnabled = this.store.selectSnapshot(PaymentState.options)
    ?.isAmlEnabled;

  public formGroup = this.fb.group({
    hidden: this.fb.group({
      amlEnabled: [this.isAmlEnabled, Validators.required],
      applicationNumber: [this.response.paymentDetails.applicationNumber, Validators.required],
      needMoreInfoScenario: [this.response.payment.specificStatus, Validators.required],
    }),
    personalForm: [null, Validators.required],
    debtForm: [
      {
        disabled: this.paymentStatus !== PaymentSpecificStatusEnum.NEED_MORE_INFO_DTI,
        value: null,
      },
      Validators.required,
    ],
    mortgageLoans: [
      {
        disabled: this.paymentStatus !== PaymentSpecificStatusEnum.NEED_MORE_INFO_SIFO,
        value: null,
      },
    ],
    securedLoans: [
      {
        disabled: this.paymentStatus !== PaymentSpecificStatusEnum.NEED_MORE_INFO_SIFO,
        value: null,
      },
    ],
    studentLoans: [
      {
        disabled: this.paymentStatus !== PaymentSpecificStatusEnum.NEED_MORE_INFO_SIFO,
        value: null,
      },
    ],
    monthlyExpensesForm: [
      {
        disabled: this.paymentStatus !== PaymentSpecificStatusEnum.NEED_MORE_INFO_SIFO,
        value: null,
      },
      Validators.required,
    ],
    amlForm: [
      null,
      Validators.required,
    ],
  });

  public loading$ = merge(
    this.actions$.pipe(
      ofActionDispatched(OpenNextStep),
      map(() => true),
    ),
    this.actions$.pipe(
      ofActionCompleted(
        OpenNextStepSuccess,
        OpenNextStepFail,
      ),
      map(() => false),
    ),
  );

  get loanFormsEnabled(): boolean {
    return this.formGroup.get('debtForm').enabled
      || this.formGroup.get('mortgageLoans').enabled
      || this.formGroup.get('securedLoans').enabled
      || this.formGroup.get('studentLoans').enabled;
  }

  constructor(
    private fb: FormBuilder,
    private store: Store,
    private actions$: Actions,
    protected injector: Injector,
    private analyticsFormService: AnalyticsFormService,
    private trackingService: TrackingService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    (window as any).PayeverStatic?.SvgIconsLoader?.loadIcons(
      ['help-24', 'info-16', 'arrow-left-16'],
      null,
      this.customElementService.shadowRoot
    );
    const nodeResult = this.nodeFlowService.getFinalResponse<NodePaymentResponseDetailsInterface>();
    !this.santanderNoFlowService.isNeedMoreInfo(nodeResult)
      && this.submitted.emit(this.formGroup.value as FormInterface);
    this.cdr.detectChanges();
    this.submit$?.pipe(tap(() => this.submitted.emit()), takeUntil(this.destroy$)).subscribe();
    this.trackingService.doEmitPaymentStepReached(this.flow.id, this.paymentMethod, 1);
    this.analyticsFormService.emitEventFormItself(ANALYTICS_FORM_NAME, AnalyticFormStatusEnum.CLOSED);
  }

  public submit(): void {
    const { valid, value } = this.formGroup;

    this.formGroupDirective.ngSubmit.emit(value);
    this.formGroupDirective.onSubmit(null);

    if (valid) {
      this.store.dispatch(new PatchFormState(value));
      this.submitted.emit(value as FormInterface);
    }
  }
}
