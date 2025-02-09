import { TestBed } from '@angular/core/testing';
import { Store } from '@ngxs/store';
import { forkJoin, of } from 'rxjs';
import { auditTime, sampleTime, take, tap } from 'rxjs/operators';

import { ApiService } from '@pe/checkout/api';
import { NodeFlowService } from '@pe/checkout/node-api';
import { PatchFlow, PatchFormState, SetFlow } from '@pe/checkout/store';
import { CommonImportsTestHelper, CommonProvidersTestHelper } from '@pe/checkout/testing';

import { flowWithPaymentOptionsFixture } from '../../test';
import {
  ApplicationFlowTypeEnum,
  EMPLOYMENT_GROUP_1_WORKING,
  EMPLOYMENT_GROUP_2_RETIRED,
  EMPLOYMENT_GROUP_3_NOT_WORKING,
  EMPLOYMENT_GROUP_4_STUDENT,
  EmploymentGroupEnum,
} from '../constants';
import { EmploymentChoice, FormValue, GuarantorRelation, InquireSectionConfig } from '../types';

import { SantanderDeApiService } from './api.service';
import { FormConfigService } from './form-config.service';

describe('FormConfigService', () => {
  let service: FormConfigService;
  let store: Store;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [
        ...CommonImportsTestHelper(),
      ],
      providers: [
        ...CommonProvidersTestHelper(),
        FormConfigService,
        NodeFlowService,
        SantanderDeApiService,
        {
          provide: ApiService, useValue: {
            _patchFlow: jest.fn().mockImplementation((_, data) => of(data)),
          },
        },
      ],
    });

    service = TestBed.inject(FormConfigService);
    store = TestBed.inject(Store);
    store.dispatch(new SetFlow(flowWithPaymentOptionsFixture()));
  });

  describe('Constructor', () => {
    it('Should create service instance', () => {
      expect(service).toBeDefined();
    });
  });

  describe('service', () => {

    const mapGroup = (list: EmploymentChoice[], group: EmploymentGroupEnum) => list.map(employment => ({
      employment,
      group,
    }));

    describe('employmentGroup$', () => {

      it.each([
        ...mapGroup(EMPLOYMENT_GROUP_1_WORKING, EmploymentGroupEnum.GROUP_1_WORKING),
        ...mapGroup(EMPLOYMENT_GROUP_2_RETIRED, EmploymentGroupEnum.GROUP_2_RETIRED),
        ...mapGroup(EMPLOYMENT_GROUP_3_NOT_WORKING, EmploymentGroupEnum.GROUP_3_NOT_WORKING),
        ...mapGroup(EMPLOYMENT_GROUP_4_STUDENT, EmploymentGroupEnum.GROUP_4_STUDENT),
        ...mapGroup(['other' as EmploymentChoice], EmploymentGroupEnum.UNKNOWN),
      ])('employmentGroup$ %#: %p', ({ employment, group }, done) => {
        service.employmentGroup$.pipe(
          auditTime(100),
          tap((employmentGroup) => {
            expect(employmentGroup).toBe(group);
            done();
          })
        ).subscribe();

        store.dispatch(new PatchFormState({
          customer: {
            personalForm: {
              employment: employment,
            },
          },
        } as FormValue));
      });
    });

    describe('ApplicationFlowType$', () => {
      it.each([
        {
          employment: EmploymentChoice.EMPLOYEE,
          guarantorRelation: GuarantorRelation.EQUIVALENT_HOUSEHOLD,
          amount: 2_600,
          applicationFlowType: ApplicationFlowTypeEnum.TwoApplicants,
        },
        {
          employment: null,
          guarantorRelation: GuarantorRelation.NONE,
          amount: 2_600,
          applicationFlowType: ApplicationFlowTypeEnum.Unknown,
        },
        {
          employment: EmploymentChoice.EMPLOYEE,
          guarantorRelation: GuarantorRelation.NONE,
          amount: 2_400,
          applicationFlowType: ApplicationFlowTypeEnum.BasicFlow,
        },
        {
          employment: EmploymentChoice.STUDENT,
          guarantorRelation: GuarantorRelation.NONE,
          amount: 2_600,
          applicationFlowType: ApplicationFlowTypeEnum.BasicStudent,
        },
        {
          employment: EmploymentChoice.EMPLOYEE,
          guarantorRelation: GuarantorRelation.NONE,
          amount: 2_600,
          applicationFlowType: ApplicationFlowTypeEnum.AdvancedFlow,
        },
      ])('applicationFlowType %#: %p', ({ applicationFlowType, ...args }, done) => {
        service.ApplicationFlowType$.pipe(
          sampleTime(200),
          tap((applicationFlowType) => {
            expect(applicationFlowType).toBe(applicationFlowType);
            done();
          })
        ).subscribe();

        store.dispatch(new PatchFormState({
          customer: {
            personalForm: {
              employment: args.employment,
              typeOfGuarantorRelation: args.guarantorRelation,
            },
          },
        } as FormValue));
        store.dispatch(new PatchFlow({
          amount: args.amount,
        }));
      });
    });
  });

  it('sectionsConfig - two applicants', () => {
    store.dispatch(new PatchFormState({
      customer: {
        personalForm: {
          typeOfGuarantorRelation: GuarantorRelation.EQUIVALENT_HOUSEHOLD,
        },
      },
    } as FormValue));

    const sectionsConfig = service.sectionsConfig();

    return forkJoin(sectionsConfig.map(sc => sc.title$.pipe(
      take(1),
    ))).pipe(
      tap((titles) => {
        expect(titles).toMatchObject([
          'More information - 1BWR',
          'Income and expenditure - 1BWR',
          'More information - 2BWR',
          'Income and expenditure - 2BWR',
        ]);
      })
    ).toPromise();
  });

  it('sectionsConfig - one applicants', () => {
    store.dispatch(new PatchFormState({
      customer: {
        personalForm: {
          typeOfGuarantorRelation: GuarantorRelation.NONE,
        },
      },
    } as FormValue));

    const sectionsConfig = service.sectionsConfig();

    return forkJoin(sectionsConfig.map(sc => sc.title$.pipe(
      take(1),
    ))).pipe(
      tap((titles) => {
        expect(titles).toMatchObject([
          'More information',
          'Income and expenditure',
          'More information',
          'Income and expenditure',
        ]);
      })
    ).toPromise();
  });

  describe('checkStepsLogic', () => {
    it('checkStepsLogic - one applicants', () => {
      const formSectionsData = [
        { name: InquireSectionConfig.FirstStepBorrower },
        { name: InquireSectionConfig.SecondStepBorrower },
        { name: InquireSectionConfig.FirstStepGuarantor },
        { name: InquireSectionConfig.SecondStepGuarantor },
      ];

      const checkStepsLogic = service.checkStepsLogic(formSectionsData);
      expect(checkStepsLogic).toMatchObject([
        { name: 'firstStepBorrower' },
        { name: 'secondStepBorrower' },
        { name: 'firstStepGuarantor', isDisabled: true },
        { name: 'secondStepGuarantor', isDisabled: true },
      ]);
    });

    it('checkStepsLogic - tow applicants', () => {
      store.dispatch(new PatchFormState({
        customer: {
          personalForm: {
            typeOfGuarantorRelation: GuarantorRelation.EQUIVALENT_HOUSEHOLD,
          },
        },
      } as FormValue));

      const formSectionsData = [
        { name: InquireSectionConfig.FirstStepBorrower },
        { name: InquireSectionConfig.SecondStepBorrower },
        { name: InquireSectionConfig.FirstStepGuarantor },
        { name: InquireSectionConfig.SecondStepGuarantor },
      ];

      const checkStepsLogic = service.checkStepsLogic(formSectionsData);
      expect(checkStepsLogic).toMatchObject([
        { name: 'firstStepBorrower' },
        { name: 'secondStepBorrower' },
        { name: 'firstStepGuarantor', isDisabled: false },
        { name: 'secondStepGuarantor', isDisabled: false },
      ]);
    });

    it('checkStepsLogic - tow applicants', () => {
      const checkStepsLogic = service.checkStepsLogic([]);
      expect(checkStepsLogic).toMatchObject([]);
    });
  });
});
