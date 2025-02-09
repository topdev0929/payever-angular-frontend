import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  EventEmitter,
  Inject,
  Input,
  OnInit,
  Output,
  ViewChild,
  inject,
} from '@angular/core';
import { FormBuilder, FormGroupDirective } from '@angular/forms';
import { Actions, Store, ofActionCompleted } from '@ngxs/store';
import { merge } from 'rxjs';
import { filter, map, take, takeUntil, tap } from 'rxjs/operators';

import { TrackingService } from '@pe/checkout/api';
import { ModeEnum } from '@pe/checkout/form-utils';
import { FlowState, PatchFormState, PaymentState, StepsState, SubmitPayment } from '@pe/checkout/store';
import { PeDestroyService } from '@pe/destroy';

import { ExtraMapperService, IncomeService } from '../../../../shared/services';
import { FormValue, PERSON_TYPE, PersonTypeEnum } from '../../../../shared/types';


@Component({
  selector: 'second-step-borrower',
  templateUrl: './second-step-borrower.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [PeDestroyService],
})
export class SecondStepBorrowerFormComponent implements OnInit {

  private readonly actions$ = inject(Actions);
  @ViewChild(FormGroupDirective) private formGroupDirective: FormGroupDirective;

  @Input() mode: ModeEnum;
  @Output() submitted = new EventEmitter<any>();

  protected readonly loading$ = merge(
    this.submitted.pipe(map(() => true)),
    this.actions$.pipe(
      ofActionCompleted(SubmitPayment),
      map(() => false),
    ),
  );

  public readonly formGroup = this.fb.group({
    incomeForm: [null],
    bankForm: [null],
    protectionForm: this.fb.control({ value: null, disabled: true }),
  });

  public readonly isLastStep = !this.store.selectSnapshot(StepsState.nextStep);
  public get translations() {
    return {
      buttonText: this.isLastStep
        ? $localize`:@@santander-de.actions.send_inquiry:`
        : $localize`:@@actions.continue:`,
    };
  }

  private flow = this.store.selectSnapshot(FlowState.flow);
  private paymentMethod = this.store.selectSnapshot(FlowState.paymentMethod);

  constructor(
    @Inject(PERSON_TYPE) private personType: PersonTypeEnum,
    private store: Store,
    private fb: FormBuilder,
    private extraMapper: ExtraMapperService,
    private destroy$: PeDestroyService,
    private trackingService: TrackingService,
    private cdr: ChangeDetectorRef,
    public incomeService: IncomeService,
  ) { }

  ngOnInit(): void {
    const cpiTariff$ = this.incomeService.cpiTariff$.pipe(
      tap((cpiTariff) => {
        cpiTariff
          ? this.formGroup.get('protectionForm').enable()
          : this.formGroup.get('protectionForm').disable();
        this.cdr.detectChanges();
      })
    );

    const formData$ = this.store.selectOnce<FormValue>(PaymentState.form).pipe(
      filter(v => Boolean(v)),
      take(1),
      tap((formData) => {
        const extra = this.extraMapper.map(this.flow.extra);
        this.formGroup.patchValue({
          ...extra?.[this.personType] ?? {},
          ...formData?.[this.personType] ?? {},
        });
      })
    );

    const valueChanges$ = this.formGroup.valueChanges.pipe(
      tap((value) => {
        const formData: FormValue = this.store.selectSnapshot(PaymentState.form);
        this.store.dispatch(new PatchFormState({
          [this.personType]: {
            ...formData?.[this.personType] ?? {},
            ...value,
          },
        }));
      }),
    );

    merge(
      cpiTariff$,
      formData$,
      valueChanges$,
    ).pipe(
      takeUntil(this.destroy$),
    ).subscribe();
  }

  public onContinue(): void {
    const { valid, value } = this.formGroup;
    this.formGroupDirective.onSubmit(null);

    if (valid) {
      this.trackingService.doEmitCustomEvent(this.flow.id, this.paymentMethod, 'customer_form2_step_passed');
      this.submitted.emit(value);
    }
  }
}
