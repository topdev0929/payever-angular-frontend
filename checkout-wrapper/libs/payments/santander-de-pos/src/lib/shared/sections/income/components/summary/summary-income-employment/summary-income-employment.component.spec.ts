import { importProvidersFrom } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Store } from '@ngxs/store';

import {
  PERSON_TYPE,
  PersonTypeEnum,
  BaseSummaryComponent,
} from '@pe/checkout/santander-de-pos/shared';
import { PaymentState, SetFlow, SetPayments } from '@pe/checkout/store';
import { CommonImportsTestHelper, CommonProvidersTestHelper } from '@pe/checkout/testing';
import { PaymentMethodEnum } from '@pe/checkout/types';

import { flowWithPaymentOptionsFixture, paymentFormFixture } from '../../../../../../test/fixtures';
import { IncomeModule } from '../../../income.module';

import { SummaryIncomeEmploymentComponent } from './summary-income-employment.component';

describe('SummaryIncomeEmploymentComponent', () => {

  let component: SummaryIncomeEmploymentComponent;
  let fixture: ComponentFixture<SummaryIncomeEmploymentComponent>;

  let store: Store;

  beforeEach(() => {

    TestBed.configureTestingModule({
      imports: [
        ...CommonImportsTestHelper(),
      ],
      providers: [
        ...CommonProvidersTestHelper(),
        importProvidersFrom(IncomeModule),
        {
          provide: PERSON_TYPE,
          useValue: PersonTypeEnum.Customer,
        },
      ],
      declarations: [
        SummaryIncomeEmploymentComponent,
      ],
      schemas: [],
    }).compileComponents();

    store = TestBed.inject(Store);
    store.dispatch(new SetFlow(flowWithPaymentOptionsFixture()));
    store.dispatch(new SetPayments({
      [PaymentMethodEnum.SANTANDER_POS_INSTALLMENT]: {
        [flowWithPaymentOptionsFixture().connectionId]: {
          ...store.selectSnapshot(PaymentState),
          form: paymentFormFixture(),
        },
      },
    }));

    fixture = TestBed.createComponent(SummaryIncomeEmploymentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();

  });

  afterEach(() => {

    jest.clearAllMocks();

  });

  it('should create an instance', () => {

    expect(component).toBeTruthy();
    expect(component instanceof BaseSummaryComponent).toBe(true);

  });

  it('should select correct values', () => {

    expect(component['paymentMethod']).toEqual(PaymentMethodEnum.SANTANDER_POS_INSTALLMENT);
    expect(component['formData']).toEqual(paymentFormFixture());

  });

  it('should dataIncomeSummary return personal incomeForm', () => {

    expect(component.dataIncomeSummary).toEqual(paymentFormFixture()[PersonTypeEnum.Customer].incomeForm);

  });

  it('should dataEmploymentSummary return personal employmentForm', () => {

    expect(component.dataEmploymentSummary).toEqual(paymentFormFixture()[PersonTypeEnum.Customer].employmentForm);

  });

  it('should dataIncomeSummary return empty object', () => {

    component.formData = {
      ...paymentFormFixture(),
      [PersonTypeEnum.Customer]: {
        ...paymentFormFixture()[PersonTypeEnum.Customer],
        incomeForm: null,
      },
    };
    expect(component.dataIncomeSummary).toEqual({});

  });

  it('should dataEmploymentSummary return empty object', () => {

    component.formData = {
      ...paymentFormFixture(),
      [PersonTypeEnum.Customer]: {
        ...paymentFormFixture()[PersonTypeEnum.Customer],
        employmentForm: null,
      },
    };
    expect(component.dataEmploymentSummary).toEqual({});

  });

});
