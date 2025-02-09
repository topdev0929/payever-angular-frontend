export type LanguageType = 'english' | 'germany';

export type LanguagesText = {
  english: string;
  germany: string;
};

export type TextContentList = {[key:string] : LanguagesText};