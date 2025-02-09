import { TranslationTemplateArgs } from '../../interfaces';

export interface TranslateServiceInterface {
  translate(key: string, args?: TranslationTemplateArgs): string;
}
