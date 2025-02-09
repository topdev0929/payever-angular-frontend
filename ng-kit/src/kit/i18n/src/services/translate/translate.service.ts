import { Injectable } from '@angular/core';
import { cloneDeep, merge } from 'lodash-es';
import { TranslationsInterface, PlainTranslationsInterface, TranslationTemplateArgs } from '../../interfaces';
import { TranslateServiceInterface } from './translate.service.interface';

interface TranslationStorage {
  [key: string]: string;
}

@Injectable()
export class TranslateService implements TranslateServiceInterface {

  private translations: TranslationsInterface = {};
  private plainTranslations: PlainTranslationsInterface = {};
  private missedKeys: string[] = [];
  private TEMPLATE_REGEXP: RegExp = /{{\s?([^{}\s]*)\s?}}/g;

  setTranslations(translations: TranslationsInterface): void {
    this.translations = cloneDeep(translations);
    this.plainTranslations = {};
    this.parseTranslationNode(this.translations, this.plainTranslations, '');
  }

  addTranslations(translations: TranslationsInterface): void {
    this.translations = merge({}, this.translations, translations);
    this.parseTranslationNode(translations, this.plainTranslations, '');
  }

  hasTranslation(key: string): boolean {
    return Boolean(this.plainTranslations[key]);
  }

  translate(key: string, args?: TranslationTemplateArgs): string {
    const value: string = this.plainTranslations[key];
    if (value) {
      if (args) {
        return this.handleArgs(value, args);
      } else {
        return value;
      }
    } else {
      return this.handleMissingKey(key);
    }
  }

  private parseTranslationNode(
    node: any,
    storage: TranslationStorage,
    keyPrefix: string
  ): void {
    Object.keys(node).forEach(key => {
      const newKey: string = keyPrefix ? `${keyPrefix}.${key}` : key;
      if (typeof node[key] === 'object') {
        this.parseTranslationNode(node[key], storage, newKey);
      } else {
        storage[newKey] = <string>node[key];
      }
    });
  }

  private handleArgs(value: string, args: TranslationTemplateArgs): string {
    return value.replace(this.TEMPLATE_REGEXP, (substring: string, parsedKey: string) => {
      const replacer: string = args[parsedKey] && String(args[parsedKey]);
      return replacer !== null && replacer !== undefined ? replacer : substring;
    });
  }

  private handleMissingKey(key: string): string {
    if (this.missedKeys.indexOf(key) < 0) {
      this.missedKeys.push(key);
      console.warn('Missing translation key:', key);
    }
    return key;
  }

}
