import { InquireSectionConfig } from '../../shared';

export const LAZY_PAYMENT_SECTIONS_DE: { [key: string]: () => Promise<any> } = {
  [InquireSectionConfig.FirstStepBorrower]:
    () => import('../components/sections/first-step-borrower/first-step-borrower.module')
      .then(m => m.FirstStepBorrowerModule),
  [InquireSectionConfig.FirstStepGuarantor]:
    () => import('../components/sections/first-step-guarantor/first-step-guarantor.module')
      .then(m => m.FirstStepGuarantorModule),
  [InquireSectionConfig.SecondStepBorrower]:
    () => import('../components/sections/second-step-borrower/second-step-borrower.module')
      .then(m => m.SecondStepBorrowerModule),
  [InquireSectionConfig.SecondStepGuarantor]:
    () => import('../components/sections/second-step-guarantor/second-step-guarantor.module')
      .then(m => m.SecondStepGuarantorModule),
};
