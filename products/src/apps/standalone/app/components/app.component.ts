import { Component, ElementRef, OnDestroy, TestabilityRegistry } from '@angular/core';
import { of, Subject } from 'rxjs';
import { catchError, takeUntil } from 'rxjs/operators';

import { TranslationLoaderService } from '@pe/i18n';

import { environment } from '../../../../environments/environment';
import { ProductsHeaderService } from '../modules/services/products-header.service';

@Component({
  selector: 'app-products-standalone',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent implements OnDestroy {
  devMode: boolean = !environment.production;
  destroy$: Subject<boolean> = new Subject<boolean>();

  constructor(
    private registry: TestabilityRegistry,
    private element: ElementRef,
    private productsHeaderService: ProductsHeaderService,
    private translationLoaderService: TranslationLoaderService,
  ) {
    this.productsHeaderService.init();
    this.initTranslations();
  }

  ngOnDestroy(): void {
    this.destroy$.next(true);
    this.destroy$.complete();
    this.registry.unregisterApplication(this.element.nativeElement);
  }


  private initTranslations() {
    return this.translationLoaderService.loadTranslations(I18nDomains).pipe(
      catchError(err => {
        console.warn('Cant load traslations for domains', I18nDomains, err);
        return of(true);
      }),
      takeUntil(this.destroy$),
    );
  }
}
export const I18nDomains = ['products-list', 'products-editor', 'ng-kit-ng-kit'];
