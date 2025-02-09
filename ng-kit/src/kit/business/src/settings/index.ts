import { RestUrlInterface } from '../interfaces';

export const urls: RestUrlInterface = {
  getBusiness: (slug: string, prefix: string) => `${prefix}business/${slug}`,
  getBusinessMenuList: (slug: string, prefix: string) => `${prefix}menu/list/${slug}`,
  getChannels: (locale: string, prefix: string) => `${prefix}channels?_locale=${locale}&isDeleted=true`,
  getCurrencies: (slug: string, prefix: string) => `${prefix}currency?business=${slug}`,
  getPaymentOptions: (locale: string, prefix: string) => `${prefix}payment-options?_locale=${locale}`
};
