export const LAZY_PAYMENT_SECTIONS_DK: { [key: string]: () => Promise<any> } = {
  mitidSkat: () => import('../../sections/inquire-mitid-skat').
    then(m => m.InquireMitidSkatModule),
  appDetails: () => import('../../sections/inquire-app-details').
    then(m => m.InquireAppDetailsModule),
};
