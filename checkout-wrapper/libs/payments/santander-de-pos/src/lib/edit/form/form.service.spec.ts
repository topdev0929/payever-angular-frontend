import { TestBed } from '@angular/core/testing';
import { FormControl, FormGroup } from '@angular/forms';
import { Store } from '@ngxs/store';
import dayjs from 'dayjs';
import weekOfYear from 'dayjs/plugin/weekOfYear';

import { EditTransactionStorageService } from '@pe/checkout/api/edit-transaction';
import { SetFlow } from '@pe/checkout/store';
import { CommonImportsTestHelper, CommonProvidersTestHelper } from '@pe/checkout/testing';
import { NodePaymentResponseInterface } from '@pe/checkout/types';


import {
  DetailsFormService,
  TransactionDataInterface,
  WeekOfDelivery,
} from '../../shared';
import { GuarantorAddressFields } from '../../shared/common/types/form.interface';
import { flowWithPaymentOptionsFixture, nodeResultFixture, paymentFormFixture } from '../../test';

import { EditFormService } from './form.service';

dayjs.extend(weekOfYear);

describe('EditFormService', () => {
  let service: EditFormService;
  let editTransactionStorageService: EditTransactionStorageService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [
        ...CommonImportsTestHelper(),
      ],
      providers: [
        ...CommonProvidersTestHelper(),
        DetailsFormService,
        EditFormService,
      ],
    });

    editTransactionStorageService = TestBed.inject(EditTransactionStorageService);
    const store = TestBed.inject(Store);
    store.dispatch(new SetFlow(flowWithPaymentOptionsFixture()));

    service = TestBed.inject(EditFormService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('transactionData', () => {
    it('should return transaction data from EditTransactionStorageService', () => {
      const transactionDataMock = {
        paymentDetails: {},
      } as NodePaymentResponseInterface<any>;

      jest.spyOn(editTransactionStorageService, 'getTransactionData').mockReturnValue(transactionDataMock);

      const result = service.transactionData;

      expect(result).toEqual(transactionDataMock);
    });
  });

  describe('transactionDetails', () => {
    it('should return payment details from transactionData', () => {
      const transactionDataMock = {
        paymentDetails: {},
      } as NodePaymentResponseInterface<any>;

      jest.spyOn(service, 'transactionData', 'get').mockReturnValue(transactionDataMock);

      const result = service.transactionDetails;

      expect(result).toEqual(transactionDataMock.paymentDetails);
    });

    it('should return undefined if transactionData is falsy', () => {
      jest.spyOn(service, 'transactionData', 'get').mockReturnValue(null);

      const result = service.transactionDetails;

      expect(result).toBeUndefined();
    });
  });

  describe('prepareCustomerGuarantorData', () => {
    it('should prepare customer or guarantor data based on the form controls', () => {
      const formGroupMock = new FormGroup({
        customer: new FormGroup({
          control1: new FormControl('customerData1'),
          control2: new FormControl('customerData2'),
        }),
        guarantor: new FormGroup({
          control1: new FormControl('guarantorData1'),
          control2: new FormControl('guarantorData2'),
        }),
      });

      const keyControl = 'customer';

      const transactionDetailsMock = {
        customer: {
          control1: 'mockCustomerData1',
          control2: 'mockCustomerData2',
        },
        guarantor: {
          control1: 'mockGuarantorData1',
          control2: 'mockGuarantorData2',
        },
      };

      jest.spyOn(service, 'transactionDetails', 'get').mockReturnValue(transactionDetailsMock as any);

      const result = service['prepareCustomerGuarantorData'](formGroupMock, keyControl);

      expect(result).toEqual({
        control1: { control1: 'mockCustomerData1', control2: 'mockCustomerData2' },
        control2: { control1: 'mockCustomerData1', control2: 'mockCustomerData2' },
      });
    });
  });


  describe('deliveryDefaultToThisWeek', () => {
    it('should default to this week if past', () => {
      const weekOfDelivery = '42.2023';
      const result = service['parseDeliveryDateWithFallback'](weekOfDelivery);
      const date = dayjs().add(1, 'day');

      expect(dayjs(result).week()).toBe(date.week());
      expect(dayjs(result).year()).toBe(date.year());
    });

    it('should parse custom week of delivery view correctly', () => {
      const week = dayjs().week();
      const year = dayjs().year();
      const weekOfDelivery = `${week}.${year}`;

      const result = service['parseDeliveryDateWithFallback'](weekOfDelivery);

      expect(dayjs(result).isValid()).toBe(true);

      expect(dayjs(result).week()).toBe(week);
      expect(dayjs(result).year()).toBe(year);
    });

    it('should get current week if date invalid', () => {
      const result = service['parseDeliveryDateWithFallback'](null);
      const week = dayjs().week();
      const year = dayjs().year();

      expect(dayjs(result).week()).toBe(week);
      expect(dayjs(result).year()).toBe(year);
    });

    it('should handle if isBefore false', () => {
      const week = 12;
      const year = dayjs().year() + 1;
      const weekOfDelivery = `${week}.${year}`;

      const result = service['parseDeliveryDateWithFallback'](weekOfDelivery);

      expect(dayjs(result).isValid()).toBe(true);

      expect(dayjs(result).week()).toBe(week);
      expect(dayjs(result).year()).toBe(year);
    });
  });

  describe('parseWeekOfDeliveryView', () => {
    it('should return THIS_WEEK for the current week', () => {
      const currentWeekOfDelivery = new Date();

      const result = service['parseWeekOfDeliveryView'](currentWeekOfDelivery);

      expect(result).toBe(WeekOfDelivery.THIS_WEEK);
    });

    it('should return NEXT_WEEK for the next week', () => {
      const nextWeekOfDelivery = dayjs().add(1, 'week').toDate();

      const result = service['parseWeekOfDeliveryView'](nextWeekOfDelivery);

      expect(result).toBe(WeekOfDelivery.NEXT_WEEK);
    });

    it('should return OTHER_WEEK for weeks other than the current and next week', () => {
      const otherWeekOfDelivery = dayjs().add(2, 'week').toDate();

      const result = service['parseWeekOfDeliveryView'](otherWeekOfDelivery);

      expect(result).toBe(WeekOfDelivery.OTHER_WEEK);
    });

    it('should handle invalid input gracefully', () => {
      const invalidWeekOfDelivery = new Date('invalid');

      const result = service['parseWeekOfDeliveryView'](invalidWeekOfDelivery);

      expect(result).toBe(WeekOfDelivery.OTHER_WEEK);
    });
  });

  describe('guarantorAddressMap', () => {
    it('should map GuarantorAddressFields to AddressFormValue correctly', () => {
      const guarantorAddressData: Partial<GuarantorAddressFields> = {
        addressCity: 'City',
        addressCountry: 'Country',
        addressFirstName: 'John',
        addressLastName: 'Doe',
        addressSalutation: 'Mr.',
        addressStreet: 'Street',
        addressStreetNumber: '123',
        addressZip: '12345',
        contactEmail: 'john.doe@example.com',
      };

      const result = service['guarantorAddressMap'](guarantorAddressData);

      expect(result).toEqual({
        city: 'City',
        country: 'Country',
        firstName: 'John',
        lastName: 'Doe',
        salutation: 'Mr.',
        street: 'Street 123',
        zipCode: '12345',
        email: 'john.doe@example.com',
      });
    });

    it('should handle missing data gracefully', () => {
      const guarantorAddressData: Partial<GuarantorAddressFields> = {
        addressCity: 'City',
      };

      const result = service['guarantorAddressMap'](guarantorAddressData);

      expect(result).toEqual({
        city: 'City',
        country: undefined,
        firstName: undefined,
        lastName: undefined,
        salutation: undefined,
        street: '',
        zipCode: undefined,
        email: undefined,
      });
    });
  });

  describe('prepareFormInitData', () => {
    const mockPayment = nodeResultFixture().payment;

    const mockTransactionData: TransactionDataInterface = {
      creditProtectionInsurance: true,
      desiredInstalment: 12,
      customer: {
        typeOfIdentification: 'Passport',
        identificationNumber: '123456789',
        identificationPlaceOfIssue: 'SomePlace',
        identificationDateOfIssue: new Date('2020-01-01'),
        identificationDateOfExpiry: new Date('2030-01-01'),
        identificationIssuingAuthority: 'SomeAuthority',
        personalDateOfBirth: new Date('1990-01-01'),
        personalNationality: 'SomeNationality',
        personalPlaceOfBirth: 'SomePlace',
        personalBirthName: 'John Doe',
      },
      guarantor: {
        typeOfIdentification: 'DL',
        identificationNumber: '987654321',
        identificationPlaceOfIssue: 'SomeOtherPlace',
        identificationDateOfIssue: new Date('2015-01-01'),
        identificationDateOfExpiry: new Date('2025-01-01'),
        identificationIssuingAuthority: 'SomeOtherAuthority',
        personalDateOfBirth: new Date('1985-01-01'),
        personalNationality: 'SomeOtherNationality',
        personalPlaceOfBirth: 'SomeOtherPlace',
        personalBirthName: 'Jane Doe',
      },
      commodityGroup: 'Electronics',
      condition: 'Good',
      creditDurationInMonths: 24,
      posVerifyType: 1,
      frontendCancelUrl: 'https://payever.org/cancel',
      frontendFailureUrl: 'https://payever.org/failure',
      frontendSuccessUrl: 'https://payever.org/success',
      posMerchantMode: true,
    };

    const customer = new FormGroup({
      _identifyForm: new FormControl(null),
      addressForm: new FormControl(null),
      employmentForm: new FormControl(null),
      incomeForm: new FormControl(null),
      bankForm: new FormControl(null),
      protectionForm: new FormControl(null),
      personalForm: new FormControl(null),
      prevAddressForm: new FormControl(null),
    });
    const guarantor = new FormGroup({
      _identifyForm: new FormControl(null),
      addressForm: new FormControl(null),
      employmentForm: new FormControl(null),
      incomeForm: new FormControl(null),
      bankForm: new FormControl(null),
      protectionForm: new FormControl(null),
      personalForm: new FormControl(null),
      prevAddressForm: new FormControl(null),
    });

    const formGroup = new FormGroup({
      ratesForm: new FormControl(null),
      detailsForm: new FormControl(null),
      termsForm: new FormControl(null),
      billingAddress: new FormControl(null),
      customer,
      guarantor,
    });
    const weekOfDeliveryView = WeekOfDelivery.THIS_WEEK;
    const weekOfDelivery = new Date(2024, 1, 1);
    const defaultConditionView = 'defaultConditionView';
    const addressForm = paymentFormFixture()['guarantor'].addressForm;

    beforeEach(() => {
      jest.spyOn(service, 'transactionData', 'get')
        .mockReturnValue({
          payment: mockPayment,
          paymentDetails: mockTransactionData,
        } as any);
      jest.spyOn(service['detailsFormService'], 'defaultConditionView')
        .mockReturnValue(defaultConditionView);
      jest.spyOn(service as any, 'guarantorAddressMap')
        .mockReturnValue(addressForm);
      jest.spyOn(service as any, 'parseWeekOfDeliveryView')
        .mockReturnValue(weekOfDeliveryView);
      jest.spyOn(service as any, 'parseDeliveryDateWithFallback')
        .mockReturnValue(weekOfDelivery);
    });

    it('should return form data', () => {
      const expectedFormInitData: any = {
        'billingAddress': {
          'commodityGroup': mockTransactionData.commodityGroup,
          'condition': mockTransactionData.condition,
          'creditDurationInMonths': mockTransactionData.creditDurationInMonths,
          'creditProtectionInsurance': mockTransactionData.creditProtectionInsurance,
          'customer': {
            ...mockTransactionData.customer,
          },
          'desiredInstalment': mockTransactionData.desiredInstalment,
          'frontendCancelUrl': mockTransactionData.frontendCancelUrl,
          'frontendFailureUrl': mockTransactionData.frontendFailureUrl,
          'frontendSuccessUrl': mockTransactionData.frontendSuccessUrl,
          'guarantor': {
            ...mockTransactionData.guarantor,
          },
          'posMerchantMode': mockTransactionData.posMerchantMode,
          'posVerifyType': mockTransactionData.posVerifyType,
        },
        'customer': {
          '_identifyForm': {
            '_docsMarkAsUploaded': true,
            ...mockTransactionData.customer,
          },
          'addressForm': {
            ...mockTransactionData.customer,
          },
          'bankForm': {
            ...mockTransactionData.customer,
          },
          'employmentForm': {
            ...mockTransactionData.customer,
          },
          'incomeForm': {
            ...mockTransactionData.customer,
          },
          'personalForm': {
            ...mockTransactionData.customer,
          },
          'prevAddressForm': {
            ...mockTransactionData.customer,
          },
          'protectionForm': {
            '_no': false,
            '_yes': true,
            'creditProtectionInsurance': true,
            'dataForwardingRsv': true,
            ...mockTransactionData.customer,
          },
        },
        'detailsForm': {
          '_condition_view': defaultConditionView,
          '_customWeekOfDelivery_view': weekOfDelivery,
          '_program_view': mockTransactionData.condition,
          '_weekOfDelivery_view': weekOfDeliveryView,
          'commodityGroup': mockTransactionData.commodityGroup,
          'condition': mockTransactionData.condition,
          'creditDurationInMonths': mockTransactionData.creditDurationInMonths,
          'creditProtectionInsurance': mockTransactionData.creditProtectionInsurance,
          'customer': {
            ...mockTransactionData.customer,
          },
          'dayOfFirstInstalment': 15,
          'desiredInstalment': mockTransactionData.desiredInstalment,
          'downPayment': 100,
          'frontendCancelUrl': mockTransactionData.frontendCancelUrl,
          'frontendFailureUrl': mockTransactionData.frontendFailureUrl,
          'frontendSuccessUrl': mockTransactionData.frontendSuccessUrl,
          'guarantor': {
            ...mockTransactionData.guarantor,
          },
          'posMerchantMode': mockTransactionData.posMerchantMode,
          'posVerifyType': mockTransactionData.posVerifyType,
        },
        'guarantor': {
          '_identifyForm': {
            '_docsMarkAsUploaded': true,
            ...mockTransactionData.guarantor,
          },
          'addressForm': {
            ...addressForm,
          },
          'bankForm': {
            ...mockTransactionData.guarantor,
          },
          'detailsForm': {
            ...addressForm,
          },
          'employmentForm': {
            ...mockTransactionData.guarantor,
          },
          'incomeForm': {
            ...mockTransactionData.guarantor,
          },
          'personalForm': {
            ...mockTransactionData.guarantor,
          },
          'prevAddressForm': {
            ...mockTransactionData.guarantor,
          },
          'protectionForm': {
            '_no': false,
            '_yes': true,
            'creditProtectionInsurance': true,
            'dataForwardingRsv': true,
            ...mockTransactionData.guarantor,
          },
        },
        'ratesForm': {
          '_desiredInstalmentView': mockTransactionData.desiredInstalment,
          'commodityGroup': mockTransactionData.commodityGroup,
          'condition': mockTransactionData.condition,
          'creditDurationInMonths': mockTransactionData.creditDurationInMonths,
          'creditProtectionInsurance': mockTransactionData.creditProtectionInsurance,
          'customer': {
            ...mockTransactionData.customer,
          },
          'desiredInstalment': mockTransactionData.desiredInstalment,
          'frontendCancelUrl': mockTransactionData.frontendCancelUrl,
          'frontendFailureUrl': mockTransactionData.frontendFailureUrl,
          'frontendSuccessUrl': mockTransactionData.frontendSuccessUrl,
          'guarantor': {
            ...mockTransactionData.guarantor,
          },
          'posMerchantMode': mockTransactionData.posMerchantMode,
          'posVerifyType': mockTransactionData.posVerifyType,
        },
        'termsForm': {
          '_agreeToBeAdvised': undefined,
          '_borrowerAgreeToBeAdvised': undefined,
          'commodityGroup': mockTransactionData.commodityGroup,
          'condition': mockTransactionData.condition,
          'creditDurationInMonths': mockTransactionData.creditDurationInMonths,
          'creditProtectionInsurance': mockTransactionData.creditProtectionInsurance,
          'customer': {
            ...mockTransactionData.customer,
          },
          'dataPrivacy': undefined,
          'desiredInstalment': mockTransactionData.desiredInstalment,
          'forOwnAccount': undefined,
          'frontendCancelUrl': mockTransactionData.frontendCancelUrl,
          'frontendFailureUrl': mockTransactionData.frontendFailureUrl,
          'frontendSuccessUrl': mockTransactionData.frontendSuccessUrl,
          'guarantor': {
            ...mockTransactionData.guarantor,
          },
          'posMerchantMode': mockTransactionData.posMerchantMode,
          'posVerifyType': mockTransactionData.posVerifyType,
        },
      };

      expect(service.prepareFormInitData(formGroup)).toEqual(expectedFormInitData);
    });
  });
});
