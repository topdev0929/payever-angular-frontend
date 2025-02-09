import { TranslateService } from './translate.service';
import { TranslationsInterface, TranslationTemplateArgs } from '../../interfaces';

describe('TranslateService', () => {
  let service: TranslateService;

  describe('invoke with empty translations', () => {
    it('should accept empty translations for future redefine', () => {
      let wasNotThrownError: any = false;
      spyOn(console, 'warn');
      try {
        service = new TranslateService();
        service.translate('unknown_key');
        service.setTranslations({});
        wasNotThrownError = true;
      } catch (e) {
        wasNotThrownError = e;
      }
      expect(wasNotThrownError).toBe(true);
    });
  });

  describe('invoke with fullfilled translations', () => {
    const translations: TranslationsInterface = {
      zero: 'A{{ count }}B',
      key1: '[translated-key1]',
      key2: '[translated-key2]',
      deepKey1: {
        subkey1: '[trasnlated-deepKey1-subkey1]',
        subkey2: '[trasnlated-deepKey1-subkey2]',
        deepSubkey1: {
          subsubkey1: '[translated-deepKey1-deepSubkey1-subsubkey1]',
          subsubkey2: '[translated-deepKey1-deepSubkey1-subsubkey2]',
        }
      }
    };

    beforeEach(() => {
      service = new TranslateService();
      service.setTranslations(translations);
    });

    it('should replace translations with .setTranslations() method', () => {
      spyOn(console, 'warn');

      const newTranslations: TranslationsInterface = {
        key1: '[new-translated-key1]',
        key3: '[new-translated-key3]',
      };
      expect(newTranslations['key1']).not.toBe(translations['key1']); // self-test
      expect(newTranslations['key3']).not.toBe(translations['key3']); // self-test

      service.setTranslations(newTranslations);
      expect(service.translate('key1')).toBe(newTranslations['key1'] as string);
      expect(service.translate('key1')).not.toBe(translations['key1'] as string);
      expect(service.translate('key2')).toBe('key2');
      expect(service.translate('key2')).not.toBe(translations['key2'] as string);
      expect(console.warn).toHaveBeenCalledTimes(1);
      expect(service.translate('key3')).not.toBe(translations['key3'] as string);
      expect(service.translate('key3')).toBe(newTranslations['key3'] as string);
      expect(console.warn).toHaveBeenCalledTimes(1);
    });

    it('should add new translations to exists with .addTranslations() method', () => {
      spyOn(console, 'warn');

      const addedTranslations: TranslationsInterface = {
        key3: '[new-translated-key3]',
      };
      expect(translations['key3']).not.toBeDefined(); // self-test

      expect(service.translate('key3')).toBe('key3');
      expect(console.warn).toHaveBeenCalledTimes(1);
      service.addTranslations(addedTranslations);
      expect(service.translate('key3')).toBe(addedTranslations['key3'] as string);
      expect('key3').not.toBe(addedTranslations['key3'] as string); // self-test
      expect(console.warn).toHaveBeenCalledTimes(1);
    });

    it('should check .hasTranslation(key) method', () => {
      const knownKey: string = 'key2';
      expect(translations[knownKey]).toBeDefined(); // self-test
      expect(service.hasTranslation(knownKey)).toBeTruthy();

      const uknownKey: string = 'key2_unknown';
      expect(translations[uknownKey]).not.toBeDefined(); // self-test
      expect(service.hasTranslation(uknownKey)).toBeFalsy();
    });

    it('should support 0 value', () => {
      expect(service.translate('zero', {count: 0})).toBe('A0B');
    });

    it('should check flat translation keys', () => {
      const key2: string = 'key2';
      const value2: string = translations[key2] as string;
      expect(value2).toBeDefined();
      expect(service.translate(key2)).toBe(value2);

      const key1: string = 'key1';
      const value1: string = translations[key1] as string;
      expect(value1).toBeDefined();
      expect(service.translate(key1)).toBe(value1);
    });

    it('should check deep translation keys', () => {
      spyOn(console, 'warn');

      const deepKey1: string = 'deepKey1.subkey1';
      const deepValue1: string = translations[deepKey1.split('.')[0]][deepKey1.split('.')[1]];
      expect(deepValue1).toBeDefined();
      expect(service.translate(deepKey1)).toBe(deepValue1);

      const deepKey2: string = 'deepKey1.subkey2';
      const deepValue2: string = translations[deepKey2.split('.')[0]][deepKey2.split('.')[1]];
      expect(deepValue2).toBeDefined();
      expect(service.translate(deepKey2)).toBe(deepValue2);

      const deepestKey1: string = 'deepKey1.deepSubkey1.subsubkey1';
      const deepestValue1: string = translations[deepestKey1.split('.')[0]][deepestKey1.split('.')[1]][deepestKey1.split('.')[2]];
      expect(deepestValue1).toBeDefined();
      expect(service.translate(deepestKey1)).toBe(deepestValue1);

      const deepestKey2: string = 'deepKey1.deepSubkey1.subsubkey2';
      const deepestValue2: string = translations[deepestKey2.split('.')[0]][deepestKey2.split('.')[1]][deepestKey2.split('.')[2]];
      expect(deepestValue2).toBeDefined();
      expect(service.translate(deepestKey2)).toBe(deepestValue2);

      const unknownDeepKey2: string = 'deepKey1.deepSubkey1_unknown';
      expect(service.translate(unknownDeepKey2)).toBe(unknownDeepKey2);
      expect(console.warn).toHaveBeenCalledTimes(1);

      const unknownDeepKey1: string = 'deepKey1.deepSubkey1.subkey_unknown';
      expect(service.translate(unknownDeepKey1)).toBe(unknownDeepKey1);
      expect(console.warn).toHaveBeenCalledTimes(2);
    });

    it('should accept template {{arguments}}', () => {
      const templateKey: string = 'templateKey1';
      const templateValue: string = '[translate_this_{{value}}]';
      const templateValueArgs: TranslationTemplateArgs = { value: '[passed_argument_value]' };
      const templateTranslatedValue: string = `[translate_this_${templateValueArgs['value']}]`;

      expect(service.hasTranslation(templateKey)).toBeFalsy();
      service.addTranslations({
        [templateKey]: templateValue
      });
      expect(service.hasTranslation(templateKey)).toBeTruthy();
      const translatedValue: string = service.translate(templateKey, templateValueArgs);
      expect(translatedValue).toBe(templateTranslatedValue);
    });

    it('should omit non-provided template arguments', () => {
      const templateKey: string = 'templateKey1';
      const templateValue: string = '[translate_this_{{value}}]';

      expect(service.hasTranslation(templateKey)).toBeFalsy();
      service.addTranslations({
        [templateKey]: templateValue
      });
      expect(service.hasTranslation(templateKey)).toBeTruthy();
      expect(service.translate(templateKey, null)).toBe(templateValue);
      expect(service.translate(templateKey, {})).toBe(templateValue);
    });

    it('should not mutate translations with .setTranslations()', () => {
      const newKey: string = '[new_translation_key]';
      const newValue: string = '[new_translation_value]';
      expect(translations[newKey]).toBeUndefined();
      service.setTranslations({
        [newKey]: newValue
      });
      expect(translations[newKey]).toBeUndefined('still should be undefined');
      expect(service.hasTranslation(newKey)).toBeTruthy();
    });

    it('should not mutate translations with .setTranslations() with deep keys', () => {
      const newDeepKeys: string[] = ['deepKey1', '[new_deep_translation_key]'];
      const newDeepValue: string = '[new_translation_value]';
      expect(translations[newDeepKeys[0]][newDeepKeys[1]]).toBeUndefined();
      service.setTranslations({
        [newDeepKeys[0]]: {
          [newDeepKeys[1]]: newDeepValue
        }
      });
      expect(translations[newDeepKeys[0]][newDeepKeys[1]]).toBeUndefined('still should be undefined');
      expect(service.hasTranslation(newDeepKeys.join('.'))).toBeTruthy();
    });

    it('should not mutate translations with .addTranslations()', () => {
      const newKey: string = '[new_translation_key]';
      const newValue: string = '[new_translation_value]';
      expect(translations[newKey]).toBeUndefined();
      service.addTranslations({
        [newKey]: newValue
      });
      expect(translations[newKey]).toBeUndefined('still should be undefined');
      expect(service.hasTranslation(newKey)).toBeTruthy();
    });

    it('should not mutate translations with .addTranslations() with deep keys', () => {
      const newDeepKeys: string[] = ['deepKey1', '[new_deep_translation_key]'];
      const newDeepValue: string = '[new_translation_value]';
      expect(translations[newDeepKeys[0]][newDeepKeys[1]]).toBeUndefined();
      service.addTranslations({
        [newDeepKeys[0]]: {
          [newDeepKeys[1]]: newDeepValue
        }
      });
      expect(translations[newDeepKeys[0]][newDeepKeys[1]]).toBeUndefined('still should be undefined');
      expect(service.hasTranslation(newDeepKeys.join('.'))).toBeTruthy();
    });
  });
});
