import { TranslatePipe } from './translate.pipe';

import { TranslateService } from '../../services';
import { TranslationsInterface, PlainTranslationsInterface } from '../../interfaces';

describe('TranslatePipe', () => {
  let pipe: TranslatePipe;

  it('should use TranslateService', () => {
    const translations: TranslationsInterface = {
      key1: '[key1]',
      keyWithArgs: '[keyWithArgs_{{value}}]',
      deep: {
        key: '[[deep_key]]'
      }
    };

    const translateService: TranslateService = new TranslateService();
    translateService.setTranslations(translations);

    pipe = new TranslatePipe(translateService);

    expect(pipe.transform('key1')).toBe(translations.key1 as string);
    expect(pipe.transform('deep.key')).toBe((translations.deep as PlainTranslationsInterface).key);

    const value: string = '[value]';
    expect(pipe.transform('keyWithArgs', { value })).toBe(`[keyWithArgs_${value}]`);
  });
});
