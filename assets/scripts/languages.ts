import { TextContentList } from './types/localization';
import { getPaymentDemoSettings } from '../apps';
import { sharedTextClasses } from "./fields"

const { textClasses } = getPaymentDemoSettings();
let translations: TextContentList | null = null;

const SHARED_TRANSLATIONS_URL = '../../scripts/locale/words.json';
const PAYMENT_TRANSLATIONS_URL = './locale/words.json';

export const loadTranslations = async (): Promise<void> => {
  try {
    const [sharedResp, paymentResp] = await Promise.all([
      fetch(SHARED_TRANSLATIONS_URL),
      fetch(PAYMENT_TRANSLATIONS_URL)
    ]);

    if (!sharedResp.ok || !paymentResp.ok) {
      console.warn('Failed to fetch translations')
    }

    const [sharedTranslations, paymentTranslations] = await Promise.all([
      sharedResp.json(),
      paymentResp.json()
    ]);

    translations = { ...sharedTranslations, ...paymentTranslations };
  } catch (error) {
    console.warn(error)
  }
};

export const getTranslations = (): TextContentList => {
  if (!translations) {
    return {};  
  }
  
  return translations;
};

export const textsClassNames = (): string[] => {
  if (!translations) {
    return [];
  }

  return [
    ...sharedTextClasses,
    ...textClasses,
  ];
};