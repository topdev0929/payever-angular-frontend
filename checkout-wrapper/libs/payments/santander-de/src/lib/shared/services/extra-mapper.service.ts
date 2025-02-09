import { Injectable } from '@angular/core';

import { FormValue, RatesFormValue } from '../types';

class Customer {
  personalDateOfBirth: string; //Date
  employment: string;
  personalSalutation: string;
  personalBirthName: string;
  personalTitle: string;
  addressLandlinePhone: string;
  addressPhoneNumber: string;
  personalNationality: string;
  personalMaritalStatus: string;
  personalOtherNationality: string;
  typeOfIdentification: string;
  identificationNumber: string;
  identificationPlaceOfIssue: string;
  identificationDateOfIssue: string; //Date
  identificationDateOfExpiry: string; //Date
  personalPlaceOfBirth: string;
  addressResidentSince: string; //Date
  prevAddressCity: string;
  prevAddressCountry: string;
  prevAddressStreetAndNumber: string;
  prevAddressZip: string;
  prevAddressResidentSince: string; //Date
  personalResidencePermit: boolean;
  personalChildren: number;
  netIncome: number;
  netIncomePartner: number;
  otherIncome: number;
  sortOfIncome: string;
  rentalIncome: number;
  incomeResidence: string;
  housingCosts: number;
  monthlyMaintenancePayments: number;
  freelancer: string;
  freelancerEmployedSince: string; //Date
  freelancerCompanyName: string;
  employer: string;
  employedSince: string; // IsoDate
}

export interface ExtraData {
  duration: number;
  downpayment: number;
  dayOfFirstInstalment: number;
  creditProtectionInsurance: boolean;
  credit_due_date: number;
  credit_accepts_requests_to_credit_agencies: boolean;
  _agreement_for_data_processing_and_transfer: boolean;
  comodity_group: string;
  condition: number;
  bank_account_bank_name: string;
  bank_i_b_a_n: string;
  bank_b_i_c: string;

  customer?: Customer;
}

@Injectable({
  providedIn: 'any',
})
export class ExtraMapperService {
  public map(extra: ExtraData): Partial<FormValue> {
    const parsed = {
      customer: {
        bankForm: {
          bank_account_bank_name: extra?.bank_account_bank_name,
          bank_i_b_a_n: extra?.bank_i_b_a_n?.toUpperCase()?.replace(/\s/g, ''),
          bank_b_i_c: extra?.bank_b_i_c,
        },
        ...extra?.customer && {
          personalForm: {
            addressCellPhone: extra.customer.addressPhoneNumber,
            addressLandlinePhone: extra.customer.addressLandlinePhone,
            addressResidentSince: extra.customer.addressResidentSince,
            identificationDateOfExpiry: extra.customer.identificationDateOfExpiry,
            identificationDateOfIssue: extra.customer.identificationDateOfIssue,
            identificationNumber: extra.customer.identificationNumber,
            identificationPlaceOfIssue: extra.customer.identificationPlaceOfIssue,
            personalBirthName: extra.customer.personalBirthName,
            typeOfIdentification: extra.customer.typeOfIdentification,
            personalMaritalStatus: extra.customer.personalMaritalStatus,
            personalNationality: extra.customer.personalNationality,
            personalOtherNationality: extra.customer.personalOtherNationality,
            personalPlaceOfBirth: extra.customer.personalPlaceOfBirth,
            personalResidencePermit: extra.customer.personalResidencePermit,
            prevAddress: {
              _prevAddressLine: extra.customer.prevAddressStreetAndNumber,
              prevAddressStreetAndNumber: extra.customer.prevAddressStreetAndNumber,
              prevAddressCity: extra.customer.prevAddressCity,
              prevAddressCountry: extra.customer.prevAddressCountry,
              prevAddressResidentSince: extra.customer.prevAddressResidentSince,
              prevAddressZip: extra.customer.prevAddressZip,
            },
            employment: extra.customer.employment,
            freelancer: !!extra.customer.freelancer,
            personalDateOfBirth: extra.customer.personalDateOfBirth,
          },
          incomeForm: {
            netIncome: extra?.customer?.netIncome && Number(extra?.customer?.netIncome),
            netIncomePartner: extra?.customer?.netIncomePartner && Number(extra?.customer?.netIncomePartner),
            otherIncome: extra?.customer?.otherIncome && Number(extra?.customer?.otherIncome),
            sortOfIncome: extra?.customer?.sortOfIncome,
            rentalIncome: extra?.customer?.rentalIncome && Number(extra?.customer?.rentalIncome),
            incomeResidence: extra?.customer?.incomeResidence && Number(extra?.customer?.incomeResidence),
            housingCosts: extra?.customer?.housingCosts && Number(extra?.customer?.housingCosts),
            monthlyMaintenancePayments: extra?.customer?.monthlyMaintenancePayments
              && Number(extra?.customer?.monthlyMaintenancePayments),
          },
          employmentForm: {
            employer: extra?.customer?.employer,
            employedSince: extra?.customer?.employedSince,
          },
        },
      },
      termsForm: {
        credit_accepts_requests_to_credit_agencies: extra?.credit_accepts_requests_to_credit_agencies,
        _agreement_for_data_processing_and_transfer: extra?._agreement_for_data_processing_and_transfer,
        credit_protection_insurance: extra?.creditProtectionInsurance,
      },
      ratesForm: {
        _down_payment_view: extra?.downpayment,
        commodity_group: extra?.comodity_group,
        down_payment: extra?.downpayment,
        credit_due_date: extra?.credit_due_date,
      } as RatesFormValue,
      hiddenForm: {
        credit_duration_in_months: extra?.duration,
      },
    };

    return this.cleanNulls(parsed);
  }

  private cleanNulls(original: any) {
    const data = JSON.parse(JSON.stringify(original));
    if (Array.isArray(data) || typeof data === 'object') {
      for (const key in data) {
        const d: any = data;
        if (d[key] === undefined || d[key] === null || !Object.keys(d[key]).length) {
          delete d[key];
        } else if (typeof d[key] === 'object') {
          this.cleanNulls(d[key]);
        }
      }
    }

    return data;
  }
}
