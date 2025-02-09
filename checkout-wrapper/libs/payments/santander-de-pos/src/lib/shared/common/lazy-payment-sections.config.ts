import { LazyPaymentSectionsInterface } from '@pe/checkout/form-utils';

export const LAZY_PAYMENT_SECTIONS_DE_POS: LazyPaymentSectionsInterface = {
  identifyBorrower: () => import('../../sections/inquire-identify-borrower').
    then(m => m.InquireIdentifyBorrowerModule),
  addressBorrower: () => import('../../sections/inquire-address-borrower').
    then(m => m.InquireAddressBorrowerModule),
  personalInfoBorrower: () => import('../../sections/inquire-personal-info-borrower').
    then(m => m.InquirePersonalInfoBorrowerModule),
  incomeBorrower: () => import('../../sections/inquire-income-borrower').
    then(m => m.InquireIncomeBorrowerModule),
  identifyGuarantor: () => import('../../sections/inquire-identify-guarantor').
    then(m => m.InquireIdentifyGuarantorModule),
  addressGuarantor: () => import('../../sections/inquire-address-guarantor').
    then(m => m.InquireAddressGuarantorModule),
  personalInfoGuarantor: () => import('../../sections/inquire-personal-info-guarantor').
    then(m => m.InquirePersonalInfoGuarantorModule),
  incomeGuarantor: () => import('../../sections/inquire-income-guarantor').
    then(m => m.InquireIncomeGuarantorModule),
};
