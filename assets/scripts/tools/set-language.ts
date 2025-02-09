import { ENGLISH_FLAG, GERMAN_FLAG } from '../common/index';
import { getTranslations, textsClassNames } from '../languages';
import { LanguageType } from '../types/localization';

export let languageActive: LanguageType = 'germany';

type LanguageData = { 
  [key in LanguageType]: {
    key: LanguageType;
    flag: string;
    label: string;
  };
}

const languageData: LanguageData = {
  english: {
    key: 'english',
    flag: ENGLISH_FLAG,
    label: 'English',
  },
  germany: {
    key: 'germany',
    flag: GERMAN_FLAG,
    label: 'German',
  },
};

const languageFlag: HTMLImageElement = document.getElementById('language-flag')! as HTMLImageElement;
const languageLabel: HTMLElement = document.getElementById('language-label')!;

export const setLanguage = (language: LanguageType): void => {
  const { key, flag, label } = languageData[language];

  languageActive = key;
  languageFlag.src = flag;
  languageLabel.innerHTML = label;

  const languageText = getTranslations();
  
  textsClassNames().forEach((item) => {
    const element: HTMLCollectionOf<HTMLElement> = document.getElementsByClassName(item) as HTMLCollectionOf<HTMLElement>;
    if (element && element[0]) {
      element[0].innerHTML = languageText[element[0].dataset.text ?? ''][language];
    }
  });
};