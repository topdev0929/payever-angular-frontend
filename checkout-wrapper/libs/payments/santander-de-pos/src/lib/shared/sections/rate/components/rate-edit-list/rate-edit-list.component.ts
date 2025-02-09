import { PercentPipe } from '@angular/common';
import { AfterViewInit, ChangeDetectionStrategy, Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormGroup, Validators } from '@angular/forms';
import { Store } from '@ngxs/store';
import dayjs from 'dayjs';
import { Observable, Subject, combineLatest, merge, of } from 'rxjs';
import {
  catchError,
  debounceTime,
  distinctUntilChanged,
  filter,
  map,
  shareReplay,
  startWith,
  switchMap,
  tap,
} from 'rxjs/operators';

import { AnalyticActionEnum, AnalyticsFormService } from '@pe/checkout/analytics';
import { CompositeForm } from '@pe/checkout/forms';
import { DATE_SETTINGS } from '@pe/checkout/forms/date';
import { RateDetailInterface, RateToggleExtraDurationInterface, RateUtilsService } from '@pe/checkout/rates';
import { PaymentInquiryStorage } from '@pe/checkout/storage';
import { FlowState, PaymentState } from '@pe/checkout/store';
import { DetailInterface, FlowExtraDurationType } from '@pe/checkout/types';
import { PeCurrencyPipe } from '@pe/checkout/utils';
import { DateUtilService } from '@pe/checkout/utils/date';

import {
  FormOptionsInterface,
  GetRatesParamsInterface,
  RateInterface,
  RatesCalculationService,
  RatesFormValue,
  SelectedInterface,
  FormValue,
  DetailsFormValue,
} from '../../../../common';



const ANALYTICS_FORM_NAME = 'FORM_RATE_SELECT';

@Component({
  selector: 'rate-edit-list',
  templateUrl: './rate-edit-list.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RateEditListComponent extends CompositeForm<RatesFormValue> implements OnInit, AfterViewInit {
  @Input() extraDuration: FlowExtraDurationType;

  @Output() selected = new EventEmitter<SelectedInterface>();

  private store = this.injector.get(Store);
  private analyticsFormService = this.injector.get(AnalyticsFormService);
  private ratesCalculationService = this.injector.get(RatesCalculationService);
  private rateUtilsService = this.injector.get(RateUtilsService);
  private currencyPipe = this.injector.get(PeCurrencyPipe);
  private percentPipe = this.injector.get(PercentPipe);
  protected storage = this.injector.get(PaymentInquiryStorage);
  private dateUtilService = this.injector.get(DateUtilService);

  private readonly flow = this.store.selectSnapshot(FlowState.flow);
  public readonly paymentMethod = this.store.selectSnapshot(FlowState.paymentMethod);
  private readonly paymentForm: FormValue = this.store.selectSnapshot(PaymentState.form);

  get ratesForm(): RatesFormValue {
    return this.paymentForm?.ratesForm ?? {} as RatesFormValue;
  }

  public readonly formGroup = this.fb.group({
    creditDurationInMonths: this.fb.control<number>(null, Validators.required),
    _rate: [null],
    desiredInstalment: [
      { disabled: true, value: null },
      Validators.max(this.flow.total),
    ],
    _desiredInstalmentView: [
      { disabled: true, value: null },
      [
        Validators.max(this.flow.total),
      ],
    ],
  },
  {
    validators: (group: FormGroup) => {
      const control = group.get('desiredInstalment');
      const viewControl = group.get('_desiredInstalmentView');

      if (!viewControl.value) {
        viewControl.setErrors(null);

        return null;
      }

      const notEqual = control.value !== viewControl.value;

      viewControl.setErrors(notEqual ? {
        ...viewControl.errors,
        required: true,
      } : null);

      return notEqual ? { required: true } : null;
    },
  });

  public readonly translations = {
    desiredInstalmentButton: $localize`:@@payment-santander-de-pos.desiredInstalment.button:`,
    ratesListEmpty: $localize`:@@payment-santander-de-pos.creditRates.error.ratesListEmpty:`,
    ratesLimit: $localize`:@@payment-santander-de-pos.creditRates.error.ratesLimit:`,
  };

  public readonly currency = this.flow.currency;
  public readonly flowId = this.flow.id;
  public readonly formData$ = this.store.select(PaymentState.form);

  public selectedExtraDurations: number[];

  private params$ = combineLatest([
    this.formGroup.get('desiredInstalment').valueChanges.pipe(
      startWith(this.formGroup.get('desiredInstalment').value),
    ),
    this.formData$.pipe(
      filter(value => !!value?.detailsForm),
      map(value => ({
        detailsForm: value.detailsForm,
        protectionForm: value.protectionForm ?? {},
      }))
    ),
  ]).pipe(
    map(([
      desiredInstalment,
      {
        detailsForm: {
          dayOfFirstInstalment,
          condition,
          customer,
          weekOfDelivery,
          downPayment,
        },
        protectionForm: {
          creditProtectionInsurance,
        },
      },
    ]) => ({
      desiredInstalment,
      dayOfFirstInstalment,
      ...{ condition },
      dateOfBirth: customer?.personalDateOfBirth
        ? this.dateUtilService.fixDate(customer.personalDateOfBirth)
        : null,
      profession: customer?.profession,
      downPayment,
      weekOfDelivery,
      amount: this.flow.total,
      cpi: creditProtectionInsurance ?? false,
    }) as GetRatesParamsInterface),
    filter(params => !!params?.condition),
    shareReplay(1),
  );

  public doSelectRate$ = new Subject<string>();
  public rates$ = this.params$.pipe(
    debounceTime(200),
    switchMap(params => this.ratesCalculationService.fetchRates(
      this.flow.id,
      params,
    ).pipe(
      map(data => this.extraDuration
        ? this.rateUtilsService.ratesFilter(data, 'duration', this.extraDuration)
        : data
      ),
      tap((rates) => {
        rates?.length && this.selectRateOnInit(rates);
      }),
      catchError(() => {
        this.selected.emit({ rate: null, data: {} });

        return of([]);
      }),
      filter(value => !!value),
    )),
    shareReplay(1),
  );

  public viewRates$ = this.rates$.pipe(
    map(rates => rates.map(rate => this.transformRate(rate))),
  );

  public loadingRates$ = merge(
    this.params$.pipe(map(() => true)),
    this.rates$.pipe(map(() => false)),
  );

  public details$ = combineLatest([
    this.formGroup.get('creditDurationInMonths').valueChanges.pipe(
      startWith(this.formGroup.get('creditDurationInMonths').value),
    ),
    this.rates$,
    this.formData$.pipe(
      map(form => form?.detailsForm?.dayOfFirstInstalment),
      filter(d => !!d),
      distinctUntilChanged(),
    ),
  ]).pipe(
    map(([duration, rates, dayOfFirstInstalment]) => ({
      rate: rates.find(rate => String(rate.duration) === String(duration)) ?? rates[0],
      dayOfFirstInstalment,
    })),
    map(({ rate, dayOfFirstInstalment }) => this.mapToDetails(rate, dayOfFirstInstalment)),
  );

  public showApply$ = combineLatest([
    this.formGroup.get('_desiredInstalmentView').valueChanges.pipe(
      startWith(this.formGroup.get('_desiredInstalmentView').value),
    ),
    this.formGroup.get('desiredInstalment').valueChanges.pipe(
      startWith(this.formGroup.get('desiredInstalment').value),
    ),
    this.loadingRates$,
  ]).pipe(
    map(([desiredInstalmentView, desiredInstalment, loadingRates]) =>
      !loadingRates
      && desiredInstalmentView !== desiredInstalment
      && !this.formGroup.get('_desiredInstalmentView').hasError('max')
    ),
  );

  public showDesiredInstalment$ = this.formData$.pipe(
    filter(value => !!value),
    map(formData => formData?.detailsForm?._enableDesiredInstalment ?? false),
  );

  public readonly options$ = this.store.select(PaymentState.options) as Observable<FormOptionsInterface>;
  public readonly isComfortCardCondition$ = combineLatest([
    this.options$,
    this.params$,
  ]).pipe(
    map(([options, { condition }]) => options.conditions
      .find(c => c.programs.find(program => program.key === condition)
        && c.isComfortCardCondition)
    ),
  );

  ngOnInit(): void {
    super.ngOnInit();
    (window as any).PayeverStatic?.SvgIconsLoader?.loadIcons(
      ['calendar-16'],
      null,
      this.customElementService.shadowRoot
    );

    if (this.ratesForm?.desiredInstalment) {
      this.showDesiredInstallment();
    }
  }

  ngAfterViewInit(): void {
    if (this.formGroup.get('_desiredInstalmentView').value) {
      this.showDesiredInstallment();
    }
  }

  public makeRateId(rate: RateInterface): string {
    return rate ? String(rate.duration) : null;
  }

  private selectRateOnInit(rates: RateInterface[]): void {
    const creditDurationInMonths = this.formGroup.get('creditDurationInMonths').value;
    const selectedRateId = creditDurationInMonths
      ? String(creditDurationInMonths)
      : rates[0].duration?.toString();

    this.rateSelected(selectedRateId, rates);
  }

  public rateSelected(id: string, rates: RateInterface[]): void {

    const selectedRate = rates.find(rate => this.makeRateId(rate) === id);
    selectedRate && this.selected.emit({
      rate: selectedRate,
      data: {
        creditDurationInMonths: selectedRate?.duration,
      },
    });

    if (
      id !== String(this.formGroup.get('creditDurationInMonths').value)
        || selectedRate?.specificData?.rsvTariff !== this.formGroup.get('_rate').value?.specificData?.rsvTariff
        || selectedRate?.totalCreditCost !== this.formGroup.get('_rate').value?.totalCreditCost
    ) {

      this.formGroup.get('creditDurationInMonths').setValue(selectedRate?.duration);
      this.formGroup.get('_rate').setValue(selectedRate);
      this.formGroup.patchValue({
        creditDurationInMonths: selectedRate?.duration,
        _rate: selectedRate,
      });
    }

    this.analyticsFormService.emitEventForm(ANALYTICS_FORM_NAME, {
      field: 'Choose rate',
      action: AnalyticActionEnum.CHANGE,
    });
  }

  public toggleRatesInStorage({ duration, checked }: RateToggleExtraDurationInterface) {
    this.selectedExtraDurations = this.storage.getExtraDurations(this.flow.id);

    this.selectedExtraDurations = checked
      ? [...this.selectedExtraDurations, duration]
      : this.selectedExtraDurations.filter(id => id !== duration);

    this.storage.setExtraDurations(this.flow.id, this.selectedExtraDurations);
  }

  public applyDesiredInstallment(): void {
    const desiredInstallment = this.formGroup.get('_desiredInstalmentView').value;
    this.formGroup.get('desiredInstalment').setValue(desiredInstallment);
  }

  public showDesiredInstallment(): void {
    this.formGroup.get('_desiredInstalmentView').enable();
    this.formGroup.get('desiredInstalment').enable();
  }

  private mapToDetails(
    rate: RateInterface,
    dayOfFirstInstalment: DetailsFormValue['dayOfFirstInstalment']
  ): DetailInterface[] {

    return [
      {
        title: $localize`:@@payment-santander-de-pos.creditRates.rateParam.interestPa:`,
        value: rate ? this.percentPipe.transform(rate.interestRate / 100, '1.0-2') : null,
      },
      {
        title: $localize`:@@payment-santander-de-pos.creditRates.rateParam.effectiveRateOfInterest:`,
        value: rate ? this.percentPipe.transform(rate.annualPercentageRate / 100, '1.0-2') : null,
      },
      {
        title: $localize`:@@payment-santander-de-pos.creditRates.rateParam.loanFee:`,
        value: rate ? this.currencyPipe.transform(rate.interest, this.flow.currency) : null, // bank_interest
      },
      {
        title: $localize`:@@payment-santander-de-pos.creditRates.rateParam.total:`,
        value: rate
          ? this.currencyPipe.transform(
            rate.totalCreditCost + this.formGroup.get('desiredInstalment').value,
            this.flow.currency,
          )
          : null,
      },
      {
        title: $localize`:@@payment-santander-de-pos.creditRates.rateParam.firstRateOn:`,
        value: rate ? this.firstRateOn(new Date(rate.dateOfFirstInstalment).toISOString(), dayOfFirstInstalment) : null,
      },
    ];
  }

  private firstRateOn(
    date: string,
    dayOfFirstInstalment: DetailsFormValue['dayOfFirstInstalment']
  ): string {
    let dateOfFirstInstalment = dayjs(date);
    const dayInMonth = Number(dateOfFirstInstalment.format('D'));

    if (dayInMonth > Number(dayOfFirstInstalment)) {
      dateOfFirstInstalment = dateOfFirstInstalment.add(1, 'M');
    }

    return dateOfFirstInstalment
      .set('D', Number(dayOfFirstInstalment))
      .format(DATE_SETTINGS.fullDate.format);
  }

  private transformRate(rate: RateInterface): RateDetailInterface {
    return {
      id: this.makeRateId(rate),
      title: $localize`:@@payment-santander-de-pos.creditRates.rateTitle:
        ${this.currencyPipe.transform(rate.monthlyPayment, this.flow.currency, 'symbol')}:subsequentInstalment:
        ${rate.duration}:duration:`,
    };
  }
}
