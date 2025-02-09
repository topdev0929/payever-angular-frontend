import { Injectable } from '@angular/core';
import { SelectSnapshot } from '@ngxs-labs/select-snapshot';
import { BehaviorSubject, Subject } from 'rxjs';

import { BusinessInterface } from '@pe/business';
import { Headings } from '@pe/confirmation-screen';
import { getLangList, LocalesConfigInterface, TranslateService } from '@pe/i18n-core';
import { BusinessState } from '@pe/user';

import { LanguageInterface } from '../../shared/interfaces/editor.interface';
import { ProductModel } from '../../shared/interfaces/product.interface';

const ENABLED_LANGUAGES = ['en', 'de', 'es', 'no', 'da', 'sv'];

@Injectable()
export class LanguageService {
  private languageStream$ = new BehaviorSubject<LanguageInterface>(null);
  private languages: LanguageInterface[] = [];

  @SelectSnapshot(BusinessState.businessData) businessData: BusinessInterface;

  noValid$ = new BehaviorSubject<boolean>(false);
  language$ = this.languageStream$.asObservable();
  readonly saved$ = new Subject<LanguageInterface>();
  updatedLanguage$ = new Subject<ProductModel>();
  selectedIndex = 0;
  defaultLanguage: string;

  get language(): LanguageInterface {
    return this.languageStream$.value;
  }

  set language(language: LanguageInterface) {
    this.findSelectedIndex(language);
    this.languageStream$.next(language);
  }

  get confirmHeadings(): Headings {
    return {
      title: this.translateService.translate('dialog_pre_update.heading_lang'),
      subtitle: this.translateService.translate('dialog_pre_update.description_lang'),
      confirmBtnText: this.translateService.translate('dialog_pre_update.yes'),
      declineBtnText: this.translateService.translate('dialog_pre_update.no'),
    };
  }

  constructor(
    private translateService: TranslateService
  ) {
    this.defaultLanguage = this.businessData.defaultLanguage;
  }

  getLanguages(): LanguageInterface[] {
    this.languages = this.languagesMapper(getLangList());
    this.setDefault();

    return this.languages;
  }

  setLanguageByCode(code: string): void {
    if (code) {
      this.language = this.languages.find(item => item.code === code);
    }
  }

  checkValidation() {
    this.noValid$.next(!this.language);
  }

  private setDefault() {
    if (this.defaultLanguage) {
      this.setLanguageByCode(this.defaultLanguage);
    }
  }

  private languagesMapper(languages: LocalesConfigInterface): LanguageInterface[] {
    return Object.keys(languages).reduce((acc, key: string) => {
      if (ENABLED_LANGUAGES.includes(key)) {
        acc.push({
          code: key,
          name: languages[key].name,
        })
      }
      return acc;
    }, []);
  }

  private findSelectedIndex(language: LanguageInterface) {
    if (language) {
      this.selectedIndex = this.languages.findIndex(item => item.code.toLowerCase() === language.code.toLowerCase());
    }
  }
}
