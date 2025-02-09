import { PebInteractionType, PebViewElementEventType } from '@pe/builder/core';

export const cookiesTriggers = [
  { name: 'Cookies Initial', value: PebViewElementEventType.CookiesInitial },
];

export const cookiesActions = [
  { name: 'Cookies Accept', value: PebInteractionType.CookiesAccept },
  { name: 'Cookies Reject', value: PebInteractionType.CookiesReject },
];
