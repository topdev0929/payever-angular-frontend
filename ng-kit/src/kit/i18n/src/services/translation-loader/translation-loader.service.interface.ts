import { Observable } from 'rxjs';

export interface TranslationLoaderServiceInterface {
  loadTranslations(i18nDomains: string | string[]): Observable<any>;
}
