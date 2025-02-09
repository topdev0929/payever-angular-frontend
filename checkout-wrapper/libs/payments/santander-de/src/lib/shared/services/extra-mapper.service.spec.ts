import { TestBed } from '@angular/core/testing';

import { CommonImportsTestHelper, CommonProvidersTestHelper } from '@pe/checkout/testing';

import { RatesFormValue } from '../types';

import { ExtraData, ExtraMapperService } from './extra-mapper.service';

describe('ExtraMapperService', () => {
  let service: ExtraMapperService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [
        ...CommonImportsTestHelper(),
      ],
      providers: [
        ...CommonProvidersTestHelper(),
      ],
    });

    service = TestBed.inject(ExtraMapperService);
  });

  describe('Constructor', () => {
    it('Should create service instance', () => {
      expect(service).toBeDefined();
    });
  });

  describe('map', () => {
    const extraData: ExtraData = {
      duration: 100,
      downpayment: 1000,
      dayOfFirstInstalment: 300,
      creditProtectionInsurance: false,
      credit_due_date: 1000,
      credit_accepts_requests_to_credit_agencies: false,
      _agreement_for_data_processing_and_transfer: false,
      comodity_group: 'group',
      condition: 1,
      bank_account_bank_name: 'test',
      bank_i_b_a_n: 'DE 1212 1212 1212 1212',
      bank_b_i_c: '12 12323 21',
      customer: {
        personalDateOfBirth: '12-12-1999',
        employment: '1',
        personalSalutation: 'Mr',
        personalBirthName: 'Test',
        personalTitle: 'Test',
        addressLandlinePhone: 'addressLandlinePhone',
        addressPhoneNumber: 'addressPhoneNumber',
        personalNationality: 'personalNationality',
        personalMaritalStatus: 'personalMaritalStatus',
        personalOtherNationality: 'personalOtherNationality',
        typeOfIdentification: 'typeOfIdentification',
        identificationNumber: 'identificationNumber',
        identificationPlaceOfIssue: 'identificationPlaceOfIssue',
        identificationDateOfIssue: 'identificationDateOfIssue',
        identificationDateOfExpiry: 'identificationDateOfExpiry',
        personalPlaceOfBirth: 'personalPlaceOfBirth',
        addressResidentSince: 'addressResidentSince',
        prevAddressCity: 'prevAddressCity',
        prevAddressCountry: 'prevAddressCountry',
        prevAddressStreetAndNumber: 'prevAddressStreetAndNumber',
        prevAddressZip: 'prevAddressZip',
        prevAddressResidentSince: 'prevAddressResidentSince',
        personalResidencePermit: false,
        personalChildren: 2,
        netIncome: 20000,
        netIncomePartner: 30,
        otherIncome: 10,
        sortOfIncome: '10000',
        rentalIncome: 1000,
        incomeResidence: '50000',
        housingCosts: 10000,
        monthlyMaintenancePayments: 4000,
        freelancer: 'freelancer',
        freelancerEmployedSince: 'freelancerEmployedSince',
        freelancerCompanyName: 'freelancerCompanyName',
        employer: 'employer',
        employedSince: 'employedSince',
      },
    };
    const expectedValue: any = {
      bankForm: {
        bank_account_bank_name: extraData.bank_account_bank_name,
        bank_i_b_a_n: extraData.bank_i_b_a_n.toUpperCase().replace(/\s/g, ''),
        bank_b_i_c: extraData.bank_b_i_c,
      },
      ...extraData.customer && {
        customer: {
          personalForm: {
            addressCellPhone: extraData.customer.addressPhoneNumber,
            addressLandlinePhone: extraData.customer.addressLandlinePhone,
            addressResidentSince: extraData.customer.addressResidentSince,
            identificationDateOfExpiry: extraData.customer.identificationDateOfExpiry,
            identificationDateOfIssue: extraData.customer.identificationDateOfIssue,
            identificationNumber: extraData.customer.identificationNumber,
            identificationPlaceOfIssue: extraData.customer.identificationPlaceOfIssue,
            personalBirthName: extraData.customer.personalBirthName,
            typeOfIdentification: extraData.customer.typeOfIdentification,
            personalMaritalStatus: extraData.customer.personalMaritalStatus,
            personalNationality: extraData.customer.personalNationality,
            personalOtherNationality: extraData.customer.personalOtherNationality,
            personalPlaceOfBirth: extraData.customer.personalPlaceOfBirth,
            personalResidencePermit: extraData.customer.personalResidencePermit,
            prevAddress: {
              _prevAddressLine: extraData.customer.prevAddressStreetAndNumber,
              prevAddressStreetAndNumber: extraData.customer.prevAddressStreetAndNumber,
              prevAddressCity: extraData.customer.prevAddressCity,
              prevAddressCountry: extraData.customer.prevAddressCountry,
              prevAddressResidentSince: extraData.customer.prevAddressResidentSince,
              prevAddressZip: extraData.customer.prevAddressZip,
            },
            employment: extraData.customer.employment,
            freelancer: !!extraData.customer.freelancer,
            personalDateOfBirth: extraData.customer.personalDateOfBirth,
          },
          incomeForm: {
            netIncome: Number(extraData.customer.netIncome),
            netIncomePartner: Number(extraData.customer.netIncomePartner),
            otherIncome: Number(extraData.customer.otherIncome),
            sortOfIncome: extraData.customer.sortOfIncome,
            rentalIncome: Number(extraData.customer.rentalIncome),
            incomeResidence: Number(extraData.customer.incomeResidence),
            housingCosts: Number(extraData.customer.housingCosts),
            monthlyMaintenancePayments: Number(extraData.customer.monthlyMaintenancePayments),
          },
          employmentForm: {
            employer: extraData?.customer?.employer,
            employedSince: extraData?.customer?.employedSince,
          },
        },
      },
      termsForm: {
        credit_accepts_requests_to_credit_agencies: extraData.credit_accepts_requests_to_credit_agencies,
        _agreement_for_data_processing_and_transfer: extraData._agreement_for_data_processing_and_transfer,
        credit_protection_insurance: extraData.creditProtectionInsurance,
      },
      ratesForm: {
        _down_payment_view: extraData.downpayment,
        commodity_group: extraData.comodity_group,
        down_payment: extraData.downpayment,
        credit_due_date: extraData.credit_due_date,
      } as RatesFormValue,
      hiddenForm: {
        credit_duration_in_months: extraData.duration,
      },
    };

    it('should perform map correctly', () => {
      const cleanNulls = jest.spyOn(service as any, 'cleanNulls');
      expect(service.map(extraData)).toMatchObject(expectedValue);
      expect(cleanNulls).toHaveBeenCalledWith(expectedValue);
    });


  });

  describe('cleanNulls', () => {

    it('should clear nulls', () => {

      const nullsObject: any = {
        field1: null,
        field2: null,
        field3: null,
        field4: null,
        field5: null,
      };
      expect(service['cleanNulls'](nullsObject)).toEqual({});

    });

    it('should clear nested nulls', () => {

      const nullsObject: any = {
        field1: null,
        field2: {
          test: 'test',
          field: null,
        },
        field3: {
          test: 'test',
          field: null,
        },
        field4: {
          test: 'test',
          field: null,
        },
        field5: {
          test: 'test',
          field: null,
        },
      };
      expect(service['cleanNulls'](nullsObject)).toEqual({
        field2: {
          test: 'test',
          field: null,
        },
        field3: {
          test: 'test',
          field: null,
        },
        field4: {
          test: 'test',
          field: null,
        },
        field5: {
          test: 'test',
          field: null,
        },
      });

    });

  });

});
