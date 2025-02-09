import { TestBed } from '@angular/core/testing';
import { Store } from '@ngxs/store';
import { DeviceUUID } from 'device-uuid';
import { of, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';

import { ChannelSetDeviceSettingsInterface } from '@pe/checkout/api';
import { PatchPaymentDetails, SetFlow } from '@pe/checkout/store';
import { CommonImportsTestHelper, CommonProvidersTestHelper, peEnvFixture } from '@pe/checkout/testing';
import { NodePaymentResponseInterface } from '@pe/checkout/types';

import { COUNTRY_CODE } from '../../../settings';
import { flowWithPaymentOptionsFixture, paymentFormFixture } from '../../../test';
import { AddressFormValue, NodePaymentDetailsInterface, PersonTypeEnum } from '../types';

import { PaymentService } from './payment.service';

describe('PaymentService', () => {
  const formData = {
    ratesForm: { creditDurationInMonths: 12, desiredInstalment: 100 },
    detailsForm: {
      dayOfFirstInstalment: '2023-01-01',
      downPayment: 500,
      customer: {
        personalDateOfBirth: '1990-01-01',
      },
    },
    termsForm: {
      advertisementConsent: true,
      customerConditionsAccepted: true,
      dataPrivacy: true,
      forOwnAccount: true,
      webIdConditionsAccepted: true,
    },
    customer: {
      bankForm: { bankIBAN: 'DE89370400440532013000' },
      employmentForm: {
        employer: 'Company XYZ',
        employedSince: '2022-01-01',
        temporaryEmployedUntil: '2023-01-01',
      },
      personalForm: {
        addressMobilePhoneNumber: '123456789',
        addressPhoneNumber: '987654321',
        addressResidentSince: '2020-01-01',
        identificationDateOfExpiry: '2024-01-01',
        identificationDateOfIssue: '2023-01-01',
        identificationIssuingAuthority: 'Authority',
        identificationNumber: '1234567890',
        identificationPlaceOfIssue: 'Place',
        profession: 'profession',
      },
      incomeForm: {
        housingCosts: 1000,
        incomeFromRent: 500,
        netIncome: 2000,
        numberOfChildren: 2,
        otherIncomeFromHousehold: 100,
        partnerIncomeNet: 1500,
        personalMaritalStatus: 'Married',
        personalNationality: 'German',
        personalPlaceOfBirth: 'City',
        profession: 'Engineer',
        supportPayment: true,
        typeOfResident: 'Permanent',
        personalDateOfBirth: '1990-01-01',
        typeOfIdentification: 'Passport',
      },
      protectionForm: { creditProtectionInsurance: true, dataForwardingRsv: true },
    },
  };

  let service: PaymentService;
  let store: Store;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [
        ...CommonImportsTestHelper(),
      ],
      providers: [
        ...CommonProvidersTestHelper(),
        PaymentService,
      ],
    });

    store = TestBed.inject(Store);
    store.dispatch(new SetFlow(flowWithPaymentOptionsFixture()));

    service = TestBed.inject(PaymentService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('postPayment', () => {
    it('should call submitPayment when isEdit is false', () => {
      service['isEdit'] = false;
      jest.spyOn(service as any, 'submitPayment').mockImplementation(() => of(null));

      const submitPaymentSpy = jest.spyOn(service as any, 'submitPayment');

      service.postPayment();

      expect(submitPaymentSpy).toHaveBeenCalled();
    });

    it('should call editPayment when isEdit is true', () => {
      service['isEdit'] = true;
      jest.spyOn(service as any, 'editPayment').mockImplementation(() => of(null));
      const editPaymentSpy = jest.spyOn(service as any, 'editPayment');

      service.postPayment();

      expect(editPaymentSpy).toHaveBeenCalled();
    });
  });

  describe('preparePayment', () => {
    it('should prepare payment details correctly without guarantor', () => {
      jest.spyOn(store, 'selectSnapshot').mockReturnValue(paymentFormFixture());
      const result = service['preparePayment']();

      result.subscribe(() => {
        expect(service['nodeFlowService'].assignPaymentDetails).toHaveBeenCalledWith({
          creditDurationInMonths: paymentFormFixture().ratesForm.creditDurationInMonths,
          desiredInstalment: paymentFormFixture().ratesForm.desiredInstalment,
          dayOfFirstInstalment: paymentFormFixture().detailsForm.dayOfFirstInstalment,
          downPayment: paymentFormFixture().detailsForm.downPayment,
          advertisementConsent: paymentFormFixture().termsForm.advertisementConsent,
          customerConditionsAccepted: paymentFormFixture().termsForm.customerConditionsAccepted,
          customer: {
            addressMobilePhoneNumber: paymentFormFixture().customer.personalForm.addressMobilePhoneNumber,
            addressPhoneNumber: paymentFormFixture().customer.personalForm.addressPhoneNumber,
            addressResidentSince: paymentFormFixture().customer.personalForm.addressResidentSince,
            bankIBAN: paymentFormFixture().customer.bankForm.bankIBAN,
            bankBIC: paymentFormFixture().customer.bankForm.bankBIC,
            employer: paymentFormFixture().customer.employmentForm.employer,
            employedSince: paymentFormFixture().customer.employmentForm.employedSince,
            housingCosts: paymentFormFixture().customer.incomeForm.housingCosts,
            identificationDateOfExpiry: paymentFormFixture().customer.personalForm.identificationDateOfExpiry,
            identificationDateOfIssue: paymentFormFixture().customer.personalForm.identificationDateOfIssue,
            identificationIssuingAuthority: paymentFormFixture().customer.personalForm.identificationIssuingAuthority,
            identificationNumber: paymentFormFixture().customer.personalForm.identificationNumber,
            identificationPlaceOfIssue: paymentFormFixture().customer.personalForm.identificationPlaceOfIssue,
            incomeFromRent: paymentFormFixture().customer.incomeForm.incomeFromRent,
            netIncome: paymentFormFixture().customer.incomeForm.netIncome,
            numberOfChildren: paymentFormFixture().customer.personalForm.numberOfChildren,
            otherIncomeFromHousehold: paymentFormFixture().customer.incomeForm.otherIncomeFromHousehold,
            incomeInfo: paymentFormFixture().customer.incomeForm.incomeInfo,
            partnerIncomeNet: paymentFormFixture().customer.incomeForm.partnerIncomeNet,
            personalMaritalStatus: paymentFormFixture().customer.personalForm.personalMaritalStatus,
            personalNationality: paymentFormFixture().customer.personalForm.personalNationality,
            personalPlaceOfBirth: paymentFormFixture().customer.personalForm.personalPlaceOfBirth,
            profession: paymentFormFixture().customer.personalForm.profession,
            supportPayment: paymentFormFixture().customer.incomeForm.supportPayment,
            temporaryEmployedUntil: paymentFormFixture().customer.employmentForm.temporaryEmployedUntil,
            typeOfResident: paymentFormFixture().customer.incomeForm.typeOfResident.toString(),
            personalDateOfBirth: paymentFormFixture().detailsForm.customer.personalDateOfBirth,
            typeOfIdentification: paymentFormFixture().customer.personalForm.typeOfIdentification,
            prevAddressForm: paymentFormFixture().customer.prevAddressForm,
          },
          creditProtectionInsurance: paymentFormFixture().customer.protectionForm.creditProtectionInsurance ?? false,
          dataForwardingRsv: paymentFormFixture().customer.protectionForm.dataForwardingRsv,
          commodityGroup: paymentFormFixture().detailsForm.commodityGroup,
          condition: paymentFormFixture().detailsForm.condition,
          dataPrivacy: paymentFormFixture().termsForm.dataPrivacy,
          forOwnAccount: paymentFormFixture().termsForm.forOwnAccount,
          typeOfGuarantorRelation: paymentFormFixture().detailsForm.typeOfGuarantorRelation,
          webIdConditionsAccepted: paymentFormFixture().termsForm.webIdConditionsAccepted,
          weekOfDelivery: paymentFormFixture().detailsForm.weekOfDelivery,
          guarantor: {
            contactEmail: paymentFormFixture().guarantor.addressForm.email,
            addressCity: paymentFormFixture().guarantor.addressForm.city,
            addressCountry: paymentFormFixture().guarantor.addressForm.country,
            addressFirstName: paymentFormFixture().guarantor.addressForm.firstName,
            addressLastName: paymentFormFixture().guarantor.addressForm.lastName,
            addressSalutation: paymentFormFixture().guarantor.addressForm.salutation,
            addressStreet: paymentFormFixture().guarantor.addressForm.street,
            addressStreetNumber: paymentFormFixture().guarantor.addressForm.streetNumber,
            addressZip: paymentFormFixture().guarantor.addressForm.zipCode,
            addressMobilePhoneNumber: paymentFormFixture().guarantor.personalForm.addressMobilePhoneNumber,
            addressPhoneNumber: paymentFormFixture().guarantor.personalForm.addressPhoneNumber,
            addressResidentSince: paymentFormFixture().guarantor.personalForm.addressResidentSince,
            employer: paymentFormFixture().guarantor.employmentForm.employer,
            employedSince: paymentFormFixture().guarantor.employmentForm.employedSince,
            housingCosts: paymentFormFixture().guarantor.incomeForm.housingCosts,
            identificationDateOfExpiry: paymentFormFixture().guarantor.personalForm.identificationDateOfExpiry,
            identificationDateOfIssue: paymentFormFixture().guarantor.personalForm.identificationDateOfIssue,
            identificationIssuingAuthority: paymentFormFixture().guarantor.personalForm.identificationIssuingAuthority,
            identificationNumber: paymentFormFixture().guarantor.personalForm.identificationNumber,
            identificationPlaceOfIssue: paymentFormFixture().guarantor.personalForm.identificationPlaceOfIssue,
            incomeFromRent: paymentFormFixture().guarantor.incomeForm.incomeFromRent,
            netIncome: paymentFormFixture().guarantor.incomeForm.netIncome,
            numberOfChildren: paymentFormFixture().guarantor.personalForm.numberOfChildren,
            otherIncomeFromHousehold: paymentFormFixture().guarantor.incomeForm.otherIncomeFromHousehold,
            incomeInfo: paymentFormFixture().guarantor.incomeForm.incomeInfo,
            partnerIncomeNet: paymentFormFixture().guarantor.incomeForm.partnerIncomeNet,
            personalMaritalStatus: paymentFormFixture().guarantor.personalForm.personalMaritalStatus,
            personalNationality: paymentFormFixture().guarantor.personalForm.personalNationality,
            personalPlaceOfBirth: paymentFormFixture().guarantor.personalForm.personalPlaceOfBirth,
            profession: paymentFormFixture().guarantor.personalForm.profession,
            supportPayment: paymentFormFixture().guarantor.incomeForm.supportPayment,
            typeOfResident: paymentFormFixture().guarantor.incomeForm.typeOfResident.toString(),
            personalDateOfBirth: paymentFormFixture().guarantor.personalForm.personalDateOfBirth,
            typeOfIdentification: paymentFormFixture().guarantor.personalForm.typeOfIdentification,
            prevAddressForm: paymentFormFixture().guarantor.prevAddressForm,
            temporaryEmployedUntil: paymentFormFixture().guarantor.employmentForm.temporaryEmployedUntil,
          },
        });
      });
    });

    it('should prepare payment details handle branches', () => {
      jest.spyOn(store, 'selectSnapshot').mockReturnValue({
        ...paymentFormFixture(),
        detailsForm: {
          ...paymentFormFixture().detailsForm,
          downPayment: null,
          customer: {
            ...paymentFormFixture().detailsForm.customer,
            personalDateOfBirth: null,
          },
        },
        [PersonTypeEnum.Customer]: {
          ...paymentFormFixture()[PersonTypeEnum.Customer],
          bankForm: {
            ...paymentFormFixture()[PersonTypeEnum.Customer].bankForm,
            bankIBAN: 'DE1213232',
          },
          incomeForm: {
            ...paymentFormFixture()[PersonTypeEnum.Customer].incomeForm,
            incomeInfo: null,
          },
          personalForm: {
            ...paymentFormFixture()[PersonTypeEnum.Customer].personalForm,
            profession: null,
          },
          prevAddressForm: null,
          protectionForm: {
            ...paymentFormFixture()[PersonTypeEnum.Customer].protectionForm,
            creditProtectionInsurance: null,
            dataForwardingRsv: null,
          },
        },
        [PersonTypeEnum.Guarantor]: {
          ...paymentFormFixture()[PersonTypeEnum.Guarantor],
          incomeForm: {
            ...paymentFormFixture()[PersonTypeEnum.Guarantor].incomeForm,
            incomeInfo: null,
          },
          prevAddressForm: null,
        },
      });

      const result = service['preparePayment']();

      result.subscribe(() => {
        expect(service['nodeFlowService'].assignPaymentDetails).toHaveBeenCalledWith({
          creditDurationInMonths: paymentFormFixture().ratesForm.creditDurationInMonths,
          desiredInstalment: paymentFormFixture().ratesForm.desiredInstalment,
          dayOfFirstInstalment: paymentFormFixture().detailsForm.dayOfFirstInstalment,
          downPayment: 0,
          advertisementConsent: paymentFormFixture().termsForm.advertisementConsent,
          customerConditionsAccepted: paymentFormFixture().termsForm.customerConditionsAccepted,
          customer: {
            addressMobilePhoneNumber: paymentFormFixture().customer.personalForm.addressMobilePhoneNumber,
            addressPhoneNumber: paymentFormFixture().customer.personalForm.addressPhoneNumber,
            addressResidentSince: paymentFormFixture().customer.personalForm.addressResidentSince,
            addressCountry: COUNTRY_CODE,
            bankIBAN: paymentFormFixture().customer.bankForm.bankIBAN,
            employer: paymentFormFixture().customer.employmentForm.employer,
            employedSince: paymentFormFixture().customer.employmentForm.employedSince,
            housingCosts: paymentFormFixture().customer.incomeForm.housingCosts,
            identificationDateOfExpiry: paymentFormFixture().customer.personalForm.identificationDateOfExpiry,
            identificationDateOfIssue: paymentFormFixture().customer.personalForm.identificationDateOfIssue,
            identificationIssuingAuthority: paymentFormFixture().customer.personalForm.identificationIssuingAuthority,
            identificationNumber: paymentFormFixture().customer.personalForm.identificationNumber,
            identificationPlaceOfIssue: paymentFormFixture().customer.personalForm.identificationPlaceOfIssue,
            incomeFromRent: paymentFormFixture().customer.incomeForm.incomeFromRent,
            netIncome: paymentFormFixture().customer.incomeForm.netIncome,
            numberOfChildren: paymentFormFixture().customer.personalForm.numberOfChildren,
            otherIncomeFromHousehold: paymentFormFixture().customer.incomeForm.otherIncomeFromHousehold,
            partnerIncomeNet: paymentFormFixture().customer.incomeForm.partnerIncomeNet,
            personalMaritalStatus: paymentFormFixture().customer.personalForm.personalMaritalStatus,
            personalNationality: paymentFormFixture().customer.personalForm.personalNationality,
            personalPlaceOfBirth: paymentFormFixture().customer.personalForm.personalPlaceOfBirth,
            profession: paymentFormFixture().detailsForm.customer.profession,
            supportPayment: paymentFormFixture().customer.incomeForm.supportPayment,
            temporaryEmployedUntil: paymentFormFixture().customer.employmentForm.temporaryEmployedUntil,
            typeOfResident: paymentFormFixture().customer.incomeForm.typeOfResident.toString(),
            personalDateOfBirth: paymentFormFixture().customer.personalForm.personalDateOfBirth,
            typeOfIdentification: paymentFormFixture().customer.personalForm.typeOfIdentification,
          },
          creditProtectionInsurance: false,
          dataForwardingRsv: paymentFormFixture().guarantor.protectionForm.dataForwardingRsv,
          commodityGroup: paymentFormFixture().detailsForm.commodityGroup,
          condition: paymentFormFixture().detailsForm.condition,
          dataPrivacy: paymentFormFixture().termsForm.dataPrivacy,
          forOwnAccount: paymentFormFixture().termsForm.forOwnAccount,
          typeOfGuarantorRelation: paymentFormFixture().detailsForm.typeOfGuarantorRelation,
          webIdConditionsAccepted: paymentFormFixture().termsForm.webIdConditionsAccepted,
          weekOfDelivery: paymentFormFixture().detailsForm.weekOfDelivery,
          guarantor: {
            contactEmail: paymentFormFixture().guarantor.addressForm.email,
            addressCity: paymentFormFixture().guarantor.addressForm.city,
            addressCountry: paymentFormFixture().guarantor.addressForm.country,
            addressFirstName: paymentFormFixture().guarantor.addressForm.firstName,
            addressLastName: paymentFormFixture().guarantor.addressForm.lastName,
            addressSalutation: paymentFormFixture().guarantor.addressForm.salutation,
            addressStreet: paymentFormFixture().guarantor.addressForm.street,
            addressStreetNumber: paymentFormFixture().guarantor.addressForm.streetNumber,
            addressZip: paymentFormFixture().guarantor.addressForm.zipCode,
            addressMobilePhoneNumber: paymentFormFixture().guarantor.personalForm.addressMobilePhoneNumber,
            addressPhoneNumber: paymentFormFixture().guarantor.personalForm.addressPhoneNumber,
            addressResidentSince: paymentFormFixture().guarantor.personalForm.addressResidentSince,
            employer: paymentFormFixture().guarantor.employmentForm.employer,
            employedSince: paymentFormFixture().guarantor.employmentForm.employedSince,
            housingCosts: paymentFormFixture().guarantor.incomeForm.housingCosts,
            identificationDateOfExpiry: paymentFormFixture().guarantor.personalForm.identificationDateOfExpiry,
            identificationDateOfIssue: paymentFormFixture().guarantor.personalForm.identificationDateOfIssue,
            identificationIssuingAuthority: paymentFormFixture().guarantor.personalForm.identificationIssuingAuthority,
            identificationNumber: paymentFormFixture().guarantor.personalForm.identificationNumber,
            identificationPlaceOfIssue: paymentFormFixture().guarantor.personalForm.identificationPlaceOfIssue,
            incomeFromRent: paymentFormFixture().guarantor.incomeForm.incomeFromRent,
            netIncome: paymentFormFixture().guarantor.incomeForm.netIncome,
            numberOfChildren: paymentFormFixture().guarantor.personalForm.numberOfChildren,
            otherIncomeFromHousehold: paymentFormFixture().guarantor.incomeForm.otherIncomeFromHousehold,
            partnerIncomeNet: paymentFormFixture().guarantor.incomeForm.partnerIncomeNet,
            personalMaritalStatus: paymentFormFixture().guarantor.personalForm.personalMaritalStatus,
            personalNationality: paymentFormFixture().guarantor.personalForm.personalNationality,
            personalPlaceOfBirth: paymentFormFixture().guarantor.personalForm.personalPlaceOfBirth,
            profession: paymentFormFixture().guarantor.personalForm.profession,
            supportPayment: paymentFormFixture().guarantor.incomeForm.supportPayment,
            typeOfResident: paymentFormFixture().guarantor.incomeForm.typeOfResident.toString(),
            personalDateOfBirth: paymentFormFixture().guarantor.personalForm.personalDateOfBirth,
            typeOfIdentification: paymentFormFixture().guarantor.personalForm.typeOfIdentification,
            temporaryEmployedUntil: paymentFormFixture().guarantor.employmentForm.temporaryEmployedUntil,
          },
        });
      });
    });
  });

  describe('makeQueryParamsStr', () => {
    const expectAssignPaymentDetails = (expected: Partial<NodePaymentDetailsInterface>, trigger: () => void) => {
      const dispatch = jest.spyOn(store, 'dispatch').mockImplementation(
        ({ payload }) => {
          expect(payload).toMatchObject(expected);

          return of(null);
        },
      );
      trigger?.();
      expect(dispatch).toHaveBeenCalledWith(new PatchPaymentDetails(expect.any(Object)));
    };

    it('should prepare payment details for edit', () => {
      jest.spyOn(service['store'], 'selectSnapshot').mockReturnValue(formData);
      const expectedPaymentDetails: Partial<NodePaymentDetailsInterface> = {
        customer: {
          addressMobilePhoneNumber: '123456789',
          addressPhoneNumber: '987654321',
          addressResidentSince: '2020-01-01',
          bankBIC: null,
          bankIBAN: 'DE89370400440532013000',
          employedSince: '2022-01-01',
          employer: 'Company XYZ',
          housingCosts: 1000,
          identificationDateOfExpiry: '2024-01-01',
          identificationDateOfIssue: '2023-01-01',
          identificationIssuingAuthority: 'Authority',
          identificationNumber: '1234567890',
          identificationPlaceOfIssue: 'Place',
          incomeFromRent: 500,
          netIncome: 2000,
          numberOfChildren: 2,
          otherIncomeFromHousehold: 100,
          partnerIncomeNet: 1500,
          personalDateOfBirth: '1990-01-01T00:00:00.000+00:00',
          personalMaritalStatus: 'Married',
          personalNationality: 'German',
          personalPlaceOfBirth: 'City',
          profession: 'profession',
          supportPayment: true,
          temporaryEmployedUntil: '2023-01-01',
          typeOfIdentification: 'Passport',
          typeOfResident: 'Permanent',
        },
      };

      expectAssignPaymentDetails(expectedPaymentDetails, () => {
        service['prepareEditPayment']();
      });
    });

    it('should prepare payment details for edit', () => {
      const data = Object.assign(formData, {
        detailsForm: {
          ...formData.detailsForm,
          customer: {
            ...formData.detailsForm.customer,
            profession: 'profession-test',
          },
        },
        customer: {
          ...formData.customer,
          bankForm: {
            bankIBAN: 'AT026000000001349870',
            bankBIC: 'bankBIC',
          },
          protectionForm: {
            ...formData.customer.protectionForm,
            creditProtectionInsurance: null,
            dataForwardingRsv: null,
          },
          prevAddressForm: null,
          personalForm: {
            ...formData.customer.personalForm,
            profession: null,
          },
        },
      });
      jest.spyOn(service['store'], 'selectSnapshot').mockReturnValue(data);
      const expectedPaymentDetails: Partial<NodePaymentDetailsInterface> = {
        customer: {
          addressMobilePhoneNumber: '123456789',
          addressPhoneNumber: '987654321',
          addressResidentSince: '2020-01-01',
          bankBIC: 'bankBIC',
          bankIBAN: 'AT026000000001349870',
          employedSince: '2022-01-01',
          employer: 'Company XYZ',
          housingCosts: 1000,
          identificationDateOfExpiry: '2024-01-01',
          identificationDateOfIssue: '2023-01-01',
          identificationIssuingAuthority: 'Authority',
          identificationNumber: '1234567890',
          identificationPlaceOfIssue: 'Place',
          incomeFromRent: 500,
          netIncome: 2000,
          numberOfChildren: 2,
          otherIncomeFromHousehold: 100,
          partnerIncomeNet: 1500,
          personalDateOfBirth: '1990-01-01T00:00:00.000+00:00',
          personalMaritalStatus: 'Married',
          personalNationality: 'German',
          personalPlaceOfBirth: 'City',
          profession: 'profession-test',
          supportPayment: true,
          temporaryEmployedUntil: '2023-01-01',
          typeOfIdentification: 'Passport',
          typeOfResident: 'Permanent',
        },
      };

      expectAssignPaymentDetails(expectedPaymentDetails, () => {
        service['prepareEditPayment']();
      });
    });
  });

  describe('prepareGuarantorAddress', () => {
    it('should prepare guarantor address', () => {
      const addressForm: Partial<AddressFormValue> = {
        city: 'TestCity',
        country: 'TestCountry',
        firstName: 'John',
        lastName: 'Doe',
        street: 'TestStreet',
        streetNumber: '123',
        salutation: 'Mr.',
        zipCode: '12345',
        email: 'john.doe@example.com',
      };

      const result = service['prepareGuarantorAddress'](addressForm);

      expect(result).toEqual({
        addressCity: 'TestCity',
        addressCountry: 'TestCountry',
        addressFirstName: 'John',
        addressLastName: 'Doe',
        addressStreet: 'TestStreet',
        addressStreetNumber: '123',
        addressSalutation: 'Mr.',
        addressZip: '12345',
        contactEmail: 'john.doe@example.com',
      });
    });

    it('should handle undefined values', () => {
      const addressForm: Partial<AddressFormValue> = {
        city: undefined,
        country: undefined,
        firstName: undefined,
        lastName: undefined,
        street: undefined,
        streetNumber: undefined,
        salutation: undefined,
        zipCode: undefined,
        email: undefined,
      };

      const result = service['prepareGuarantorAddress'](addressForm);

      expect(result).toEqual({});
    });
  });

  describe('submitPayment', () => {
    it('should submit payment successfully', (done) => {
      jest.spyOn(store, 'select').mockReturnValue(of({ merchantMode: false }));
      jest.spyOn(service as any, 'preparePayment').mockImplementation(v => of(v));
      jest.spyOn(service['apiService'], 'getChannelSetDeviceSettings').mockReturnValue(of({
        enabled: true,
      } as ChannelSetDeviceSettingsInterface));
      jest.spyOn(service['nodeApiService'], 'getShopUrls').mockReturnValue(of({
        successUrl: 'https://successUrl.com',
        cancelUrl: 'https://cancelUrl.com',
        failureUrl: 'https://failureUrl.com',
        pendingUrl: 'https://pendingUrl.com',
      }));
      jest.spyOn(service['nodeFlowService'], 'assignPaymentDetails').mockReturnValue(of(null));
      jest.spyOn(service['nodeFlowService'], 'postPayment').mockReturnValue(of({
        payment: {},
      } as NodePaymentResponseInterface<unknown>));

      service['submitPayment']().subscribe(() => {
        expect(service['nodeFlowService'].assignPaymentDetails).toHaveBeenCalled();
        expect(service['nodeFlowService'].postPayment).toHaveBeenCalled();
        done();
      });
    });

    it('should submit return null if getChannelSetDeviceSettings catch error', (done) => {
      jest.spyOn(store, 'select').mockReturnValue(of({ merchantMode: false }));
      jest.spyOn(service as any, 'preparePayment').mockImplementation(v => of(v));
      jest.spyOn(service['apiService'], 'getChannelSetDeviceSettings').mockReturnValue(throwError(new Error()));
      jest.spyOn(service['nodeApiService'], 'getShopUrls').mockReturnValue(of({
        successUrl: 'https://successUrl.com',
        cancelUrl: 'https://cancelUrl.com',
        failureUrl: 'https://failureUrl.com',
        pendingUrl: 'https://pendingUrl.com',
      }));
      jest.spyOn(service['nodeFlowService'], 'assignPaymentDetails').mockReturnValue(of(null));
      jest.spyOn(service['nodeFlowService'], 'postPayment').mockReturnValue(of({
        payment: {},
      } as NodePaymentResponseInterface<unknown>));

      service['submitPayment']().subscribe(() => {
        expect(service['nodeFlowService'].assignPaymentDetails).toHaveBeenCalled();
        expect(service['nodeFlowService'].postPayment).toHaveBeenCalled();
        done();
      });
    });

    it('should submit payment successfully if shopurls not found', (done) => {
      jest.spyOn(store, 'select').mockReturnValue(of({ merchantMode: false }));
      jest.spyOn(service as any, 'preparePayment').mockImplementation(v => of(v));
      jest.spyOn(service['apiService'], 'getChannelSetDeviceSettings').mockReturnValue(of({
        enabled: true,
      } as ChannelSetDeviceSettingsInterface));
      jest.spyOn(service['nodeApiService'], 'getShopUrls').mockReturnValue(of({
        successUrl: null,
        cancelUrl: null,
        failureUrl: null,
        pendingUrl: null,
      }));
      jest.spyOn(service['nodeFlowService'], 'assignPaymentDetails').mockReturnValue(of(null));
      jest.spyOn(service['nodeFlowService'], 'postPayment').mockReturnValue(of({
        payment: {},
      } as NodePaymentResponseInterface<unknown>));

      const checkoutWrapper = peEnvFixture().frontend.checkoutWrapper;
      const locale = 'en';
      const flowId = flowWithPaymentOptionsFixture().id;
      const deviceUUID = new DeviceUUID();

      jest.spyOn(service['localeConstantsService'], 'getLang').mockReturnValue(locale);

      service['submitPayment']().subscribe(() => {
        expect(service['nodeFlowService'].assignPaymentDetails).toHaveBeenCalledWith({
          posMerchantMode: false,
          posVerifyType: undefined,
          frontendSuccessUrl: `${checkoutWrapper}/${locale}/pay/${flowId}/redirect-to-payment?deviceUUID=${deviceUUID.get()}&staticPage=success`,
          frontendFailureUrl: `${checkoutWrapper}/${locale}/pay/${flowId}/static-finish/fail`,
          frontendCancelUrl: `${checkoutWrapper}/${locale}/pay/${flowId}/redirect-to-choose-payment?deviceUUID=${deviceUUID.get()}&staticPage=fail`,
        });
        expect(service['nodeFlowService'].postPayment).toHaveBeenCalled();
        done();
      });
    });

    it('should handle error during submit payment', (done) => {
      jest.spyOn(store, 'select').mockReturnValue(of({ merchantMode: true }));
      jest.spyOn(service as any, 'preparePayment').mockImplementation(v => of(v));
      jest.spyOn(service['apiService'], 'getChannelSetDeviceSettings').mockReturnValue(of({
        enabled: true,
      } as ChannelSetDeviceSettingsInterface));
      jest.spyOn(service['nodeApiService'], 'getShopUrls').mockReturnValue(of({
        successUrl: 'https://successUrl.com',
        cancelUrl: 'https://cancelUrl.com',
        failureUrl: 'https://failureUrl.com',
        pendingUrl: 'https://pendingUrl.com',
      }));
      jest.spyOn(service['nodeFlowService'], 'assignPaymentDetails').mockReturnValue(of(null));
      jest.spyOn(service['nodeFlowService'], 'postPayment')
        .mockReturnValue(throwError(null));

      service['submitPayment']().pipe(
        catchError(() => {
          expect(service['nodeFlowService'].assignPaymentDetails).toHaveBeenCalled();
          expect(service['nodeFlowService'].postPayment).toHaveBeenCalled();
          done();

          return of(null);
        }),
      ).subscribe();
    });
  });

  describe('editPayment', () => {
    it('should edit payment successfully', (done) => {
      const mockTransactionDetails = {
        posVerifyType: 'mockPosVerifyType',
        posMerchantMode: true,
        frontendSuccessUrl: 'mockSuccessUrl',
        frontendFailureUrl: 'mockFailureUrl',
        frontendCancelUrl: 'mockCancelUrl',
      };

      jest.spyOn(service as any, 'prepareEditPayment').mockImplementation(v => of(v));
      jest.spyOn(service['editTransactionStorageService'], 'getTransactionData')
        .mockReturnValue({ paymentDetails: mockTransactionDetails } as NodePaymentResponseInterface<any>);
      jest.spyOn(service['editTransactionStorageService'], 'getTransactionId')
        .mockReturnValue('mockTransactionId');
      jest.spyOn(service['nodeFlowService'], 'assignPaymentDetails').mockReturnValue(of(null));
      jest.spyOn(service['nodeFlowService'], 'editTransaction').mockReturnValue(of({
        payment: {},
      } as NodePaymentResponseInterface<unknown>));

      service['editPayment']().subscribe(() => {
        expect(service['nodeFlowService'].assignPaymentDetails).toHaveBeenCalledWith(mockTransactionDetails);
        expect(service['nodeFlowService'].editTransaction).toHaveBeenCalledWith('mockTransactionId');
        done();
      });
    });

    it('should handle error during edit payment', (done) => {
      jest.spyOn(service as any, 'prepareEditPayment').mockImplementation(v => of(v));
      jest.spyOn(service['editTransactionStorageService'], 'getTransactionData')
        .mockReturnValue({ id: 'id' } as NodePaymentResponseInterface<any>);
      jest.spyOn(service['editTransactionStorageService'], 'getTransactionId')
        .mockReturnValue('mockTransactionId');
      jest.spyOn(service['nodeFlowService'], 'assignPaymentDetails').mockReturnValue(of(null));
      jest.spyOn(service['nodeFlowService'], 'editTransaction').mockReturnValue(throwError(null));

      service['editPayment']().pipe(
        catchError(() => {
          expect(service['nodeFlowService'].assignPaymentDetails).toHaveBeenCalled();
          expect(service['nodeFlowService'].editTransaction).toHaveBeenCalledWith('mockTransactionId');
          done();

          return of(null);
        }),
      ).subscribe();
    });
  });

  describe('convertForeignZips', () => {
    it('should convert', () => {
      const zips = [
        'ZIP 1020',
        'ZIP 01-940',
        '1691 E ',
      ];

      zips.forEach((zipCode) => {
        expect(service['convertForeignZips'](zipCode)).toHaveLength(5);
        expect(service['convertForeignZips'](zipCode)).toMatch(/\d/);
      });
    });
  });
});
