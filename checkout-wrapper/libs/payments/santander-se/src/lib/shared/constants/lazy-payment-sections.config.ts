import { InquireSectionConfig } from '../common';

export const LAZY_PAYMENT_SECTIONS_SE: { [key in InquireSectionConfig]: () => Promise<any> } = {
  inquireAml: () => import('../../sections/inquire-aml/inquire-aml.module').
    then(m => m.SantanderSeInquiryAmlModule),
  inquireEba: () => import('../../sections/inquire-eba/inquire-eba.module').
    then(m => m.SantanderSeInquiryEbaModule),
};
