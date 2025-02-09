import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { AbstractControl, ValidationErrors, ValidatorFn, Validators } from '@angular/forms';
import { MatDatepickerInputEvent } from '@angular/material/datepicker';
import { Store } from '@ngxs/store';
import dayjs from 'dayjs';
import advancedFormat from 'dayjs/plugin/advancedFormat';
import isoWeek from 'dayjs/plugin/isoWeek';
import weekday from 'dayjs/plugin/weekday';
import { combineLatest, defer, merge } from 'rxjs';
import { filter, map, shareReplay, startWith, takeUntil, tap } from 'rxjs/operators';

import { CompositeForm } from '@pe/checkout/forms';
import { RequiredDate, DateConstraints } from '@pe/checkout/forms/date';
import { FlowState, ParamsState, PaymentState } from '@pe/checkout/store';
import { CurrencySymbolPipe, PeCurrencyPipe } from '@pe/checkout/utils';
import { DateUtilService } from '@pe/checkout/utils/date';
import { PeDestroyService } from '@pe/destroy';

import {
  DetailsFormValue,
  FormOptionsInterface,
  GuarantorRelation,
  WeekOfDelivery,
  FormValue,
} from '../../../../common';

import { DetailsFormService } from './details-form.service';

dayjs.extend(advancedFormat);
dayjs.extend(isoWeek);
dayjs.extend(weekday);


@Component({
  selector: 'details-form',
  templateUrl: './details-form.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [PeDestroyService, CurrencySymbolPipe],
})
export class DetailsFormComponent extends CompositeForm<DetailsFormValue> implements OnInit {

  private store = this.injector.get(Store);
  private dateUtilService = this.injector.get(DateUtilService);
  private currencyPipe = this.injector.get(PeCurrencyPipe);
  protected detailsFormService = this.injector.get(DetailsFormService);

  private readonly flow = this.store.selectSnapshot(FlowState.flow);
  private readonly paymentForm: FormValue = this.store.selectSnapshot(PaymentState.form);
  private readonly merchantMode = this.store.selectSnapshot(ParamsState.merchantMode);
  public readonly options: FormOptionsInterface = this.store
    .selectSnapshot(PaymentState.options);

  protected programs$ = defer(() => this.formGroup.get('_condition_view').valueChanges.pipe(
    startWith(this.formGroup.get('_condition_view').value),
    map(idx => this.options.conditions[Number(idx)].programs.map(program => ({
      label: $localize`:@@payment-santander-de-pos.inquiry.form._program_view.valuePattern:${program.program}:program:`,
      value: program.key,
    }))),
    tap((programs) => {
      const program = this.formGroup.get('_program_view').value;
      if (!programs?.find(p => p.value === program)) {
        this.formGroup.get('_program_view').setValue(programs?.[0].value);
      }
    }),
  ));

  get detailsForm(): DetailsFormValue {
    return this.paymentForm?.detailsForm ?? {} as DetailsFormValue;
  }

  protected readonly customerForm = this.fb.group({
    profession: [{
      disabled: !this.merchantMode,
      value: this.detailsForm?.customer?.profession ?? this.options.professions[0].value,
    }, [Validators.required]],
    personalDateOfBirth: [{
      disabled: !this.merchantMode,
      value: this.detailsForm?.customer?.personalDateOfBirth,
    }, RequiredDate],
  });

  protected readonly formGroup = this.fb.group({
    _enableDesiredInstalment: this.fb.control<boolean>(
      null,
      [Validators.required],
    ),

    commodityGroup: this.fb.control<string>(
      { disabled: !this.merchantMode, value: null },
      [Validators.required],
    ),
    _condition_view: this.fb.control<number | string>(
      {
        disabled: !this.merchantMode,
        value: null,
      },
      [Validators.required],
    ),
    condition: this.fb.control<string>(
      null,
      [Validators.required],
    ),
    _program_view: this.fb.control<string>(
      { disabled: !this.merchantMode, value: null },
      [Validators.required],
    ),
    typeOfGuarantorRelation: this.fb.control<GuarantorRelation>(
      {
        disabled: !this.merchantMode,
        value: null,
      },
      [Validators.required],
    ),
    weekOfDelivery: this.fb.control<string>(
      { disabled: !this.merchantMode, value: null },
      [Validators.required],
    ),
    _weekOfDelivery_view: this.fb.control<WeekOfDelivery>(
      {
        disabled: !this.merchantMode,
        value: null,
      },
      [Validators.required],
    ),
    _customWeekOfDelivery_view: this.fb.control<string | Date>(
      { disabled: !this.merchantMode, value: null },
      RequiredDate,
    ),
    dayOfFirstInstalment: this.fb.control<number>(
      null,
      [Validators.required],
    ),
    customer: this.customerForm,
    _downPayment_view: this.fb.control<number>({
      disabled: !this.options.isDownPaymentAllowed,
      value: null,
    }, [this.downPaymentValidator()]),
    downPayment: this.fb.control<number>({
      disabled: !this.options.isDownPaymentAllowed,
      value: null,
    }),
  });

  protected readonly isComfortCardCondition$ = this.formGroup.get('condition').valueChanges.pipe(
    startWith(this.formGroup.get('condition').value),
    map(condition => this.options.conditions.find(c => c.programs.find(program => program.key === condition)
      && c.isComfortCardCondition),
    ),
    shareReplay(1),
  );

  protected readonly translations = {
    paymentText: this.merchantMode
      ? $localize`:@@payment-santander-de-pos.inquiry.form.term.merchant_note:`
      : $localize`:@@payment-santander-de-pos.inquiry.form.term.self_note:`,
  };

  protected readonly currency = this.flow.currency;
  protected readonly adultDateConstraints = DateConstraints.adultDateOfBirth;
  protected readonly futureDateConstraints = DateConstraints.future;

  protected showApply$ = combineLatest([
    this.formGroup.get('_downPayment_view').valueChanges.pipe(
      startWith(this.formGroup.get('_downPayment_view').value),
    ),
    this.formGroup.get('downPayment').valueChanges.pipe(
      startWith(this.formGroup.get('downPayment').value),
    ),
  ]).pipe(
    map(([view, value]) => view !== value),
  );

  ngOnInit(): void {
    super.ngOnInit();

    this.formGroup.get('_downPayment_view').setValue(this.formGroup.get('downPayment').value);

    const conditionChanges$ = this.formGroup.get('_program_view').valueChanges.pipe(
      startWith(this.formGroup.get('_program_view').value),
      filter(value => !!value),
      tap((value) => {
        this.formGroup.get('condition').setValue(value);
        this.formGroup.get('_enableDesiredInstalment').setValue(
          this.detailsFormService.isDefaultMerchantCondition(this.options.conditions, value)
        );
      }),
    );

    const toggleCustomWeek$ = this.formGroup.get('_weekOfDelivery_view').valueChanges.pipe(
      startWith(this.formGroup.get('_weekOfDelivery_view').value),
      tap((value) => {
        value === WeekOfDelivery.OTHER_WEEK
          ? this.formGroup.get('_customWeekOfDelivery_view').enable()
          : this.formGroup.get('_customWeekOfDelivery_view').disable();
      }),
    );

    const setWeek$ = combineLatest([
      this.formGroup.get('_weekOfDelivery_view').valueChanges.pipe(
        startWith(this.formGroup.get('_weekOfDelivery_view').value),
        filter(value => [WeekOfDelivery.NEXT_WEEK, WeekOfDelivery.THIS_WEEK].includes(value)),
        tap((value) => {
          let weekValue: string;
          if (value === WeekOfDelivery.NEXT_WEEK) {
            weekValue = dayjs().add(1, 'week').format('W.YYYY');
          } else {
            weekValue = dayjs().format('W.YYYY');
          }
          this.formGroup.get('weekOfDelivery').setValue(weekValue);
        }),
      ),
      this.formGroup.get('_customWeekOfDelivery_view').valueChanges.pipe(
        startWith(this.formGroup.get('_customWeekOfDelivery_view').value),
        filter(value => this.formGroup.get('_customWeekOfDelivery_view').enabled && !!value),
        tap((value) => {
          const date = this.dateUtilService.fixDate(value);

          this.formGroup.get('weekOfDelivery').setValue(dayjs(date).format('W.YYYY'));
        }),
      ),
    ]);

    const typeOfGuarantorRelation$ = this.isComfortCardCondition$.pipe(
      tap((value) => {
        value && this.formGroup.get('typeOfGuarantorRelation').setValue(GuarantorRelation.NONE);
      }
      ),
    );

    merge(
      conditionChanges$,
      toggleCustomWeek$,
      setWeek$,
      typeOfGuarantorRelation$,
    ).pipe(
      takeUntil(this.destroy$),
    ).subscribe();
  }

  protected applyDownPayment(): void {
    const downPayment_view = this.formGroup.get('_downPayment_view');
    if (!downPayment_view.errors?.max) {
      this.formGroup.get('downPayment').setValue(downPayment_view.value);
    }
  }

  protected onDateChange(event: MatDatepickerInputEvent<any, any>): void {
    const date = this.dateUtilService.fixDate(event.value);
    const lastDayOfWeek = dayjs(date).endOf('week').toDate();

    this.formGroup.get('_customWeekOfDelivery_view').setValue(lastDayOfWeek);
  }

  private get maxDownPayment(): number {
    const { min } = this.store.selectSnapshot(FlowState.paymentOption);

    return this.flow.total - min;
  }

  private downPaymentValidator(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors => !control.value || control.value <= this.maxDownPayment
      ? null
      : {
        max: $localize`:@@form.customer_payment.help_texts.down_payment:
        ${this.currencyPipe.transform(this.maxDownPayment, this.currency, 'symbol')}:max_amount:`,
      };
  }
}
