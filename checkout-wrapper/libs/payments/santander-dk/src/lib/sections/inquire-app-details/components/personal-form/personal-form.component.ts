import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { Validators } from '@angular/forms';
import { Store } from '@ngxs/store';
import { merge } from 'rxjs';
import { delay, filter, map, startWith, takeUntil, tap, withLatestFrom } from 'rxjs/operators';

import { AnalyticConsentEventEnum } from '@pe/checkout/analytics';
import { YesNoOptions } from '@pe/checkout/form-utils';
import { CompositeForm } from '@pe/checkout/forms';
import { DateConstraints, RequiredDate } from '@pe/checkout/forms/date';
import { emailRequiredValidator } from '@pe/checkout/forms/email';
import { PhoneValidators, phoneMask } from '@pe/checkout/forms/phone';
import { FlowState, PaymentState } from '@pe/checkout/store';
import { FormOptionInterface } from '@pe/checkout/types';
import { CurrencySymbolPipe } from '@pe/checkout/utils';
import { PeDestroyService } from '@pe/destroy';

import { PersonalFormValue } from '../../../../shared';
import {
  CITIZENSHIP_TYPES,
  EMPLOYMENT_TYPE,
  MARITAL_STATUS,
  RESIDENCE_PERMIT_TYPE,
  RESIDENTIAL_TYPE,
} from '../../app-details-constants';

import { confirmEmailValidator } from './validators';

const ALLOWED_HOUSEHOLD_EXPENSES_FOR_MARTIAL = ['1', '2'];
const CITIZENSHIP_TYPE_OTHER = '1';
export enum EmploymentTypeEnum {
  PART_TIME_MORE = 8,
  PART_TIME_BELOW = 3,
}

@Component({
  selector: 'personal-form',
  templateUrl: './personal-form.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  styles: [`
    .product-consent-action {
      padding-left: 3px;
      cursor: pointer;
    }
    .product-consent {
      .mat-checkbox {
        margin-top: 5px;
      }
    }
  `],
  providers: [
    PeDestroyService,
    CurrencySymbolPipe,
  ],
})
export class PersonalFormComponent extends CompositeForm<PersonalFormValue> implements OnInit {


  private store = this.injector.get(Store);

  public readonly analyticConsentEventEnum = AnalyticConsentEventEnum;
  public readonly phoneMask = phoneMask;

  public formGroup = this.fb.group({
    phoneNumber: this.fb.control<string>(
      null,
      [
        Validators.required,
        PhoneValidators.country('DK', $localize`:@@santander-dk.inquiry.form.phone_number.label:`),
        PhoneValidators.codeRequired('DK'),
      ],
    ),
    emailAddress: [null, emailRequiredValidator],
    _confirmEmail: [null, [emailRequiredValidator, confirmEmailValidator]],
    productConsentOptOut: [{ disabled: true, value: false }],
    maritalStatus: [null, [Validators.required]],
    citizenship: [null, [Validators.required]],
    _householdExpenses: [{ disabled: true, value: null }, [Validators.required]],
    householdBudgetPercentage: [{ disabled: true, value: null }, [Validators.required]],
    residencePermitNumber: [{ disabled: true, value: null }, [Validators.required]],
    residencePermitType: [{ disabled: true, value: null }, [Validators.required]],
    residencePermitDate: [{ disabled: true, value: null }, RequiredDate],
    employmentType: [null, [Validators.required]],
    employedSince: [null, RequiredDate],
    residentialType: [null, [Validators.required]],
    currentYearDebt: [null, [Validators.required]],
    _disableSafeInsurance: [null],
  });

  protected readonly productConsentTranslations = {
    agreeText: $localize`:@@santander-dk.inquiry.form.product_consent.agree_text:`,
    action: $localize`:@@santander-dk.inquiry.form.product_consent.action:`,
    label: $localize`:@@santander-dk.inquiry.form.product_consent.label:`,
  };

  public readonly pastDateConstraints = DateConstraints.past;
  public readonly booleanOptions = YesNoOptions;
  public readonly currency = this.store.selectSnapshot(FlowState.flow).currency;
  private options$ = this.store.select(PaymentState.options);

  public get translations() {
    const employmentType = this.formGroup.get('employmentType').value;

    return {
      employedSince: employmentType === 2
        ? $localize`:@@santander-dk.inquiry.form.unemployed_since.label:Unemployed since`
        : $localize`:@@santander-dk.inquiry.form.employed_since.label:Employed since`,
    };
  }

  public maritalStatusOptions$ = this.options$.pipe(
    map(options => this.translateOptions(options.maritalStatuses, MARITAL_STATUS)),
  );

  public citizenshipOptions$ = this.options$.pipe(
    map(options => this.translateOptions(options.citizenshipTypes, CITIZENSHIP_TYPES, true)),
  );

  public employmentTypeOptions$ = this.options$.pipe(
    map(options => this.translateOptions(options.employmentTypes, EMPLOYMENT_TYPE)),
  );

  public residentialTypeOptions$ = this.options$.pipe(
    map(options => this.translateOptions(options.residentialTypes, RESIDENTIAL_TYPE)),
  );

  public residencePermitTypeOptions$ = this.options$.pipe(
    map(options => this.translateOptions(options.residencePermitTypes, RESIDENCE_PERMIT_TYPE)),
  );

  override writeValue(value: PersonalFormValue): void {
    if (value.productConsentOptOut) {
      this.formGroup.get('productConsentOptOut').enable();
    }

    super.writeValue(value);
  }

  ngOnInit(): void {
    super.ngOnInit();
    (window as any).PayeverStatic?.SvgIconsLoader?.loadIcons(
      ['calendar-16'],
      null,
      this.customElementService.shadowRoot,
    );

    const employmentTypeChanged$ = this.formGroup.get('employmentType').valueChanges.pipe(
      delay(200), // wait for the label to be updated
      tap(() => this.formGroup.get('employedSince').updateValueAndValidity()),
    );

    const toggleHousehold$ = this.formGroup.get('maritalStatus').valueChanges.pipe(
      startWith(this.formGroup.get('maritalStatus').value),
      filter(value => value !== undefined && value !== null),
      tap((maritalStatus: number | string) => {
        if (ALLOWED_HOUSEHOLD_EXPENSES_FOR_MARTIAL.includes(maritalStatus.toString())) {
          this.formGroup.get('_householdExpenses').enable();
        } else {
          this.formGroup.get('_householdExpenses').disable();
        }
      }),
    );

    const toggleHouseholdPercentage$ = merge(
      this.formGroup.get('_householdExpenses').valueChanges.pipe(
        startWith(this.formGroup.get('_householdExpenses').value),
      ),
      this.formGroup.get('_householdExpenses').statusChanges.pipe(
        withLatestFrom(this.formGroup.get('_householdExpenses').valueChanges),
        map(([status, value]) => value && status !== 'DISABLED')
      )
    ).pipe(
      filter(value => value !== undefined && value !== null),
      tap((householdExpenses: boolean) => {
        householdExpenses
          ? this.formGroup.get('householdBudgetPercentage').enable({ emitEvent: false })
          : this.formGroup.get('householdBudgetPercentage').disable({ emitEvent: false });
      }),
    );

    const toggleHideSafeInsurance$ = this.formGroup.get('employmentType').valueChanges.pipe(
      startWith(this.formGroup.get('employmentType').value),
      filter(value => value !== undefined && value !== null),
      tap((value: number) => {
        this.formGroup.get('_disableSafeInsurance').patchValue(value === EmploymentTypeEnum.PART_TIME_BELOW);
      }),
    );

    const toggleResidence$ = this.formGroup.get('citizenship').valueChanges.pipe(
      startWith(this.formGroup.get('citizenship').value),
      filter(value => value !== undefined && value !== null),
      tap((citizenship: number | string) => {
        if (citizenship.toString() !== CITIZENSHIP_TYPE_OTHER) {
          this.formGroup.get('residencePermitNumber').disable({ emitEvent: false });
          this.formGroup.get('residencePermitType').disable({ emitEvent: false });
          this.formGroup.get('residencePermitDate').disable({ emitEvent: false });
        } else {
          this.formGroup.get('residencePermitNumber').enable({ emitEvent: false });
          this.formGroup.get('residencePermitType').enable({ emitEvent: false });
          this.formGroup.get('residencePermitDate').enable({ emitEvent: false });
        }
      }),
    );

    merge(
      employmentTypeChanged$,
      toggleHousehold$,
      toggleHouseholdPercentage$,
      toggleResidence$,
      toggleHideSafeInsurance$,
    ).pipe(
      takeUntil(this.destroy$),
    ).subscribe();
  }

  public showProductConsentOptOut() {
    this.formGroup.get('productConsentOptOut').enable();
  }

  public onPaste(event: ClipboardEvent): void {
    event.preventDefault();
  }

  private translateOptions(options: FormOptionInterface[], keysPool: string[] = [], byIndex = false) {
    return options.map((value, index) => ({
      label: keysPool[byIndex ? index : value.value as number],
      value: value.value,
    }));
  }
}
