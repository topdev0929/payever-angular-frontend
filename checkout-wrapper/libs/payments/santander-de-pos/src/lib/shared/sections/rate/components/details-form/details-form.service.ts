import { Injectable } from '@angular/core';
import { SelectSnapshot } from '@ngxs-labs/select-snapshot';
import { Store } from '@ngxs/store';

import { FlowState, ParamsState, PaymentState } from '@pe/checkout/store';
import { FlowInterface } from '@pe/checkout/types';

import {
  ConditionInterface,
  DetailsFormValue,
  FormOptionsInterface,
  FormValue,
  GuarantorRelation,
} from '../../../../common';
import { MERCHANT_DEFAULT_CONDITION, SELF_DEFAULT_CONDITION } from '../../constants';

import { DAYS_OF_INSTALLMENT, WEEKS_OF_DELIVERY } from './constants';

const ComfortCardMaxAmount = 1500;

@Injectable()
export class DetailsFormService {
  @SelectSnapshot(FlowState.flow) flow!: FlowInterface;
  @SelectSnapshot(ParamsState.merchantMode) merchantMode!: boolean;


  public readonly options: FormOptionsInterface = this.store
    .selectSnapshot(PaymentState.options);

  private readonly paymentForm: FormValue = this.store.selectSnapshot(PaymentState.form);


  public readonly defaultCondition = this.options?.defaultCondition;
  public readonly weeksOfDelivery = WEEKS_OF_DELIVERY;
  public readonly daysOfInstalment = DAYS_OF_INSTALLMENT;

  get detailsForm(): DetailsFormValue {
    return this.paymentForm?.detailsForm ?? {} as DetailsFormValue;
  }

  get initialDetailsForm(): DetailsFormValue {
    return {
      ...this.detailsForm,
      _enableDesiredInstalment: this.isDefaultMerchantCondition(
        this.options?.conditions,
        this.detailsForm.condition
      ),
      _condition_view: this.detailsForm._condition_view
        ?? this.defaultConditionView(),
      _program_view: this.detailsForm._program_view ?? this.defaultCondition,
      condition: this.detailsForm.condition ?? this.merchantMode ? null : this.defaultCondition,
      typeOfGuarantorRelation: this.detailsForm.typeOfGuarantorRelation ?? GuarantorRelation.NONE,
      _weekOfDelivery_view: this.detailsForm._weekOfDelivery_view
        ?? this.weeksOfDelivery[0].value,
      dayOfFirstInstalment: this.detailsForm.dayOfFirstInstalment ?? this.daysOfInstalment[0].value,
    };
  }

  public conditions = this.options?.conditions.reduce((acc, condition, idx) => {
    if (condition.isComfortCardCondition && this.flow.amount > ComfortCardMaxAmount) {
      return acc;
    }

    return [
      ...acc,
      {
        label: condition.description,
        value: idx,
      },
    ];
  }, []);

  constructor(
    private store: Store,
  ) {

  }

  public defaultConditionView(condition: string = null): string {
    const conditionLabel: string = this.conditionDescriptionByProgram(condition ?? this.defaultCondition);
    const defaultConditionLabel = this.merchantMode ? MERCHANT_DEFAULT_CONDITION : SELF_DEFAULT_CONDITION;

    return this.conditions?.find(condition => condition.label === conditionLabel)?.value
      ?? this.conditions?.find(condition => condition.label === defaultConditionLabel)?.value
      ?? this.conditions[0]?.value;
  }

  public isDefaultMerchantCondition(conditions: ConditionInterface[], program: string): boolean {
    const programs = conditions?.find(condition => condition.description === MERCHANT_DEFAULT_CONDITION)?.programs;

    return programs ? programs.reduce((acc, item) => ([...acc, item.key]), []).includes(program) : false;
  }

  private conditionDescriptionByProgram(conditionValue: string): string {
    return conditionValue?
      this.options?.conditions.find(
        condition => !!condition.programs.find(program => program.key === conditionValue)
      )?.description : '';
  }
}
