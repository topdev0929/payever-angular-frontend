export enum InquireSectionConfig {
  Additional = 'additional',
  CreditZ = 'creditZ'
}

export const LAZY_PAYMENT_SECTIONS_NO: { [key in InquireSectionConfig]: () => Promise<any> } = {
  additional: () => import('./components/details')
    .then(m => m.DetailsSectionModule),
  creditZ: () => import('./components/credit')
    .then(m => m.CreditSectionModule),
};
