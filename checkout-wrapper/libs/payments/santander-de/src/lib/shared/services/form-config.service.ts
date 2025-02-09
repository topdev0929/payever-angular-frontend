import { Injectable } from '@angular/core';
import { Store } from '@ngxs/store';
import { Observable, Subject, combineLatest } from 'rxjs';
import { map, shareReplay, startWith } from 'rxjs/operators';

import { SectionDataInterface, SectionSchemeInterface } from '@pe/checkout/form-utils';
import { FlowState, PaymentState } from '@pe/checkout/store';

import {
  ApplicationFlowTypeEnum,
  EMPLOYMENT_GROUP_1_WORKING,
  EMPLOYMENT_GROUP_2_RETIRED,
  EMPLOYMENT_GROUP_3_NOT_WORKING,
  EMPLOYMENT_GROUP_4_STUDENT,
  EmploymentGroupEnum,
} from '../constants';
import {
  EmploymentChoice,
  FormValue,
  GuarantorRelation,
  InquireSectionConfig,
  NodePaymentDetailsInterface,
} from '../types';

@Injectable({ providedIn: 'root' })
export class FormConfigService {

  constructor(
    private store: Store,
  ) { }

  private onCheckStepsLogic$ = new Subject<void>();
  private amount$ = this.store.select(FlowState.flow).pipe(
    map(flow => flow.amount)
  );

  private formData$ = combineLatest([
    this.store.select<FormValue>(PaymentState.form).pipe(
      startWith(null as FormValue),
    ),
    this.store.select<NodePaymentDetailsInterface>(PaymentState.details).pipe(
      startWith(null as NodePaymentDetailsInterface),
    ),
  ]).pipe(
    map(([formValue, details]) => {
      const guarantorRelation = formValue?.customer?.personalForm?.typeOfGuarantorRelation
        || details?.customer?.typeOfGuarantorRelation;

      const employment = formValue?.customer?.personalForm?.employment as EmploymentChoice
        || details?.customer?.profession as EmploymentChoice;

      return {
        employment,
        guarantorRelation,
        twoApplicants: guarantorRelation && guarantorRelation !== GuarantorRelation.NONE,
      };
    }),
    shareReplay(1),
  );

  public ApplicationFlowType$ = combineLatest([
    this.formData$,
    this.amount$,
  ]).pipe(
    map(([{ employment, twoApplicants }, amount]) => {
      if (twoApplicants) {
        return ApplicationFlowTypeEnum.TwoApplicants;
      }
      if (!employment || !amount) {
        return ApplicationFlowTypeEnum.Unknown;
      }

      if ([
        ...EMPLOYMENT_GROUP_1_WORKING,
        ...EMPLOYMENT_GROUP_2_RETIRED,
      ].includes(employment)) {
        return amount < 2500
          ? ApplicationFlowTypeEnum.BasicFlow
          : ApplicationFlowTypeEnum.AdvancedFlow;
      }

      return EMPLOYMENT_GROUP_3_NOT_WORKING.includes(employment)
        ? ApplicationFlowTypeEnum.BasicFlow
        : ApplicationFlowTypeEnum.BasicStudent;
    }),
    shareReplay(1),
  );

  public employmentGroup$: Observable<EmploymentGroupEnum> = this.formData$.pipe(
    map(({ employment }) => {
      switch (true) {
        case EMPLOYMENT_GROUP_1_WORKING.includes(employment):
          return EmploymentGroupEnum.GROUP_1_WORKING;
        case EMPLOYMENT_GROUP_2_RETIRED.includes(employment):
          return EmploymentGroupEnum.GROUP_2_RETIRED;
        case EMPLOYMENT_GROUP_3_NOT_WORKING.includes(employment):
          return EmploymentGroupEnum.GROUP_3_NOT_WORKING;
        case EMPLOYMENT_GROUP_4_STUDENT.includes(employment):
          return EmploymentGroupEnum.GROUP_4_STUDENT;
        default:
          return EmploymentGroupEnum.UNKNOWN;
      }
    })
  );

  sectionsConfig(): SectionSchemeInterface<InquireSectionConfig>[] {
    return [
      {
        name: InquireSectionConfig.FirstStepBorrower,
        title$: this.wrapPersonTitle(
          $localize`:@@payment-santander-de-pos.inquiry.steps.customerPersonalAndBank.title:More information`, 1
        ),
        isButtonHidden: true,
      },
      {
        name: InquireSectionConfig.SecondStepBorrower,
        title$: this.wrapPersonTitle(
          $localize`:@@payment-santander-de-pos.inquiry.steps.customerIncomeAndEmploymentOrStudy.title:Income and expenditure`,
          1,
        ),
        isButtonHidden: true,
      },
      // Guarantor
      {
        name: InquireSectionConfig.FirstStepGuarantor,
        title$: this.wrapPersonTitle(
          $localize`:@@payment-santander-de-pos.inquiry.steps.customerPersonalAndBank.title:More information`, 2
        ),
        isButtonHidden: true,
      },
      {
        name: InquireSectionConfig.SecondStepGuarantor,
        title$: this.wrapPersonTitle(
          $localize`:@@payment-santander-de-pos.inquiry.steps.customerIncomeAndEmploymentOrStudy.title:Income and expenditure`,
          2,
        ),
        isButtonHidden: true,
      },
    ];
  }

  private wrapPersonTitle(title: string, index: number): Observable<string> {
    return this.onCheckStepsLogic$.pipe(
      startWith(''),
      map(() => `${title}${this.getPersonTitlePostfix(index, this.twoApplicants)}`),
      shareReplay(1)
    );
  }

  private getPersonTitlePostfix(index: number, twoApplicants: boolean): string {
    if (twoApplicants) {
      const borrower = $localize`:@@payment-santander-de-pos.inquiry.steps.borrowerShort:${index}:personNumber:BWR`;

      return ` - ${borrower}`;
    }

    return '';
  }


  public checkStepsLogic(formSectionsData: SectionDataInterface[])
    : SectionDataInterface[] {

    if (!formSectionsData?.length) {
      return [];
    }
    this.onCheckStepsLogic$.next();
    const disabledSettings = this.disabledSettings();

    return formSectionsData.map((section: SectionDataInterface<InquireSectionConfig>) => {
      if (disabledSettings[section.name] !== undefined) {
        section.isDisabled = disabledSettings[section.name] && !section.isActive;
      }

      return section;
    });
  }


  private disabledSettings(): { [key in InquireSectionConfig]?: boolean } {
    return {
      [InquireSectionConfig.FirstStepGuarantor]: !this.twoApplicants,
      [InquireSectionConfig.SecondStepGuarantor]: !this.twoApplicants,
    };
  }

  private get twoApplicants() {
    const formData = this.store.selectSnapshot<FormValue>(PaymentState.form);
    const guarantorRelation = formData?.customer?.personalForm?.typeOfGuarantorRelation;

    return guarantorRelation && guarantorRelation !== GuarantorRelation.NONE;
  }
}
