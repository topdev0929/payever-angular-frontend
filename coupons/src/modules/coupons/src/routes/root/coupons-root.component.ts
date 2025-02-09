import { ChangeDetectionStrategy, ChangeDetectorRef, Component, Inject, OnDestroy, OnInit, ViewEncapsulation } from '@angular/core';
import { Router } from '@angular/router';
import { BehaviorSubject, of, ReplaySubject } from 'rxjs';
import { catchError, takeUntil, tap } from 'rxjs/operators';

import { AppThemeEnum, EnvService } from '@pe/common';
import { TranslationLoaderService } from '@pe/i18n-core';

@Component({
  selector: 'pe-coupons',
  templateUrl: './coupons-root.component.html',
  styleUrls: ['./coupons-root.component.scss'],
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PeCouponsRootComponent implements OnInit, OnDestroy {

  translationsReady$ = new BehaviorSubject(false);

  contactHref = 'mailto:support@payever.de?subject=Contact%20payever';

  isSubheaderMode = false;

  public theme = this.envService?.businessData?.themeSettings?.theme
    ? AppThemeEnum[this.envService.businessData.themeSettings.theme]
    : AppThemeEnum.default;
  protected destroyed$ = new ReplaySubject<boolean>();

  constructor(
    public router: Router,
    public cdr: ChangeDetectorRef,
    private envService: EnvService,
    private translationLoaderService: TranslationLoaderService,
  ) { }

  ngOnInit(): void {
    this.initTranslations();
  }

  ngOnDestroy() {
    this.destroyed$.next(true);
    this.destroyed$.complete();
  }

  private initTranslations(): void {
    this.translationLoaderService
      .loadTranslations(['coupons-app', 'data-grid-app', 'filters-app'])
      .pipe(
        tap(() => {
          this.translationsReady$.next(true);
        }),
        catchError((err) => {
          console.warn('Cant load translations for domains', ['coupons-app', 'data-grid-app', 'filters-app'], err);
          return of(true);
        }),
        takeUntil(this.destroyed$),
      )
      .subscribe();
  }
}
