import { Component, OnDestroy, OnInit } from '@angular/core';
import { catchError, takeUntil } from 'rxjs/operators';
import { BehaviorSubject, of, ReplaySubject } from 'rxjs';

import { TranslationLoaderService } from '@pe/i18n-core';
import { PeDataGridTheme } from '@pe/common';

@Component({
  selector: 'contacts-layout',
  templateUrl: 'contacts-layout.component.html',
})
export class PeContactsLayoutComponent implements OnInit, OnDestroy {

  protected destroyed$ = new ReplaySubject<boolean>();
  translationsReady$ = new BehaviorSubject(false);

  body: HTMLElement = document.body;
  theme = PeDataGridTheme.Dark;

  constructor(
    private translationLoaderService: TranslationLoaderService
  ) {
  }

  ngOnInit(): void {
    this.initTranslations();
    this.body.classList.add(this.theme);
  }

  ngOnDestroy(): void {
    this.body.classList.remove(this.theme);
    this.destroyed$.next(true);
    this.destroyed$.complete();
  }

  private initTranslations(): void {
    this.translationLoaderService
      .loadTranslations(['contacts-app', 'filters-app'])
      .pipe(
        catchError((err: any) => {
          console.warn('Cant load translations for domains', ['contacts-app', 'filters-app'], err);
          return of(true);
        }),
        takeUntil(this.destroyed$),
      )
      .subscribe(() => {
        this.translationsReady$.next(true);
      });
  }
}
