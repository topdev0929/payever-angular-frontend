import { Injectable, Provider } from '@angular/core';

import { TranslateService } from './translate.service';
import { TranslateServiceInterface } from './translate.service.interface';
import { TranslationTemplateArgs } from '../../interfaces';

@Injectable()
export class TranslateStubService implements TranslateServiceInterface {

  useArgs: boolean = false;

  // Useful to test custom translation in unit tests
  nextTranslation: string;

  // useSalt is useful flag to check that TranslateServiceInterface client
  // performed them work
  set useSalt(salt: string | boolean) {
    if (typeof salt === 'boolean') {
      this.salt = salt ? Math.random().toString(10).slice(2) : null;
    } else {
      this.salt = salt;
    }
  }
  get useSalt(): boolean | string {
    return this.salt || false;
  }

  private salt: string;

  translate(key: string, args?: TranslationTemplateArgs): string {
    if (this.nextTranslation) {
      const nextTranslation: string = this.nextTranslation;
      delete this.nextTranslation;
      return nextTranslation;
    }

    let result: string = this.useSalt ? `${this.salt}_${key}` : key;

    if (args && this.useArgs) {
      result += JSON.stringify(args);
    }

    return result;
  }

  hasTranslation(key: string): boolean {
    return true;
  }

  static provide(): Provider {
    return {
      provide: TranslateService,
      useClass: TranslateStubService
    };
  }

}
