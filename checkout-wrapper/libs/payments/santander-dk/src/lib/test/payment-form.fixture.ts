import { cloneDeep } from '@pe/checkout/utils';

import { FormValue } from '../shared';

export const paymentFormFixture: () => FormValue = () => cloneDeep<FormValue>({
  ratesForm: {
    _isSafeInsuranceAllowed: true,
    productId: '12345',
    monthlyAmount: 300.00,
    totalCreditAmount: 5000.00,
    creditDurationInMonths: 12,
  },
  termsForm: {
    digitalConsent: true,
    acceptBusinessTerms: true,
  },
  mitIdForm: {
    debtorId: 'debtor-123',
    applicationNumber: 'app-456',
  },
  skatIdForm: {
    _skatReady: true,
  },
  bankConsentForm: {
    _bankConsentReady: true,
    _psd2Status: false,
  },
  bankDetailsForm: {
    bankRegistrationNumber: '1234',
    bankAccountNumber: '56789012345',
    eCard: true,
  },
  carsForm: {
    _count: 1,
    cars: [
      {
        age: 30,
        monthlyExpense: 13,
        financedType: 1,
        financedTypeView: {
          title: 'cars-1-title',
          label: 'cars-1-label',
          value: '1',
          index: 1,
        },
      },
    ],
  },
  childrenForm: {
    _count: 2,
    children: [{ age: 5 }, { age: 7 }],
  },
  cprDetailsForm: {
    _addressLine: 'Main Street 5',
    firstName: 'John',
    lastName: 'Doe',
    socialSecurityNumber: '010170-1234',
    city: 'Copenhagen',
    address: 'Some Address 101',
    postalCode: '1000',
    _insuranceEnabled: true,
    _insuranceMonthlyCost: 0,
    _insurancePercent: 0,
  },
  exposedPersonForm: {
    politicalExposedPerson: false,
  },
  financeDetailsForm: {
    monthlySalaryBeforeTax: 40000,
    totalDebt: 150000,
    totalTransportCostMonthly: 500,
    totalRentMonthly: 8000,
    insuranceFormUnemployment: true,
    payWithMainIncome: false,
    paySource: 'Salary',
    otherPaySource: '',
  },
  personalForm: {
    phoneNumber: '+4533210772',
    emailAddress: 'test@payever.org',
    _confirmEmail: 'test@payever.org',
    productConsentOptOut: true,
    maritalStatus: '1',
    citizenship: '1',
    householdBudgetPercentage: 30,
    _householdExpenses: '5000',
    residencePermitNumber: 'AB123456',
    residencePermitType: 'Permanent',
    residencePermitDate: '01-01-2002',
    employmentType: 2,
    employedSince: '01-01-2002',
    residentialType: 'Owner',
    currentYearDebt: 20000,
    _disableSafeInsurance: false,
  },
  safeInsuranceForm: {
    wantsSafeInsurance: false,
    insuranceForUnemployment: false,
  },
  confirmForm: {
    applyOnBehalfOfOther: true,
    confirmEnteredData: true,
    _agreeObtainCreditStatus: true,
  },
});
