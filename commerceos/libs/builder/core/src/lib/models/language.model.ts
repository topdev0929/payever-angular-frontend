export interface PebLanguage {
  key: string;
  title: string;
  active: boolean;
  locale: PebLanguageEnum;
}

export interface PebThemeLanguageSetting {
  languages: { [key: string]: PebLanguage };
  defaultLanguage?: PebLanguage;
  autoDetect: boolean;
}

export enum PebLanguageEnum {
  Generic = 'generic',
  English = 'english',
  German = 'german',
  Italian = 'italian',
  Spanish = 'spanish',
  Chinese = 'chinese',
}

export const PEB_DEFAULT_LANG_KEY = 'en';

export const PebDefaultLanguages: { [key: string]: PebLanguage } = {
  en: {
    title: 'English (United States)',
    key: 'en',
    active: true,
    locale: PebLanguageEnum.English,
  },
};

export const PebDefaultLanguageSetting: PebThemeLanguageSetting = {
  languages: PebDefaultLanguages,
  defaultLanguage: PebDefaultLanguages.en,
  autoDetect: false,
};