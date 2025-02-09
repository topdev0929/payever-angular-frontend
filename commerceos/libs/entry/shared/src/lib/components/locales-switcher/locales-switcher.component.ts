import { Component, EventEmitter, Injector, Input, OnInit, Output, ViewChild } from '@angular/core';
import { MatMenuTrigger } from '@angular/material/menu';
import { ActivatedRoute, Router } from '@angular/router';
import { BehaviorSubject } from 'rxjs';
import { map, skip, switchMap, take, takeUntil, tap } from 'rxjs/operators';

import { PeDestroyService } from '@pe/common';
import { LocaleInterface, LocaleService, retrieveLocale, TranslationLoaderService } from '@pe/i18n-core';
import { PeOverlayConfig, PeOverlayRef, PeOverlayWidgetService } from '@pe/overlay-widget';

import { CosLocaleListComponent } from '../locale-list/locale-list.component';

@Component({
  selector: 'cos-locales-switcher',
  templateUrl: './locales-switcher.component.html',
  styleUrls: ['./locales-switcher.component.scss'],
  providers: [
    PeDestroyService,
  ],
})
export class CosLocalesSwitcherComponent implements OnInit {

  @Input() transparent = false;
  @Input() dark = false;
  @Input() reloadPageOnSwitch = true;
  @Input() allowedLocales: string[] = null;

  @Output() localeChanged: EventEmitter<void> = new EventEmitter<void>();

  locales: LocaleInterface[] = [];
  currentLocale: LocaleInterface;

  @ViewChild('matMenuTrigger') matMenuTrigger: MatMenuTrigger;


  private translationLoaderService: TranslationLoaderService = this.injector.get(TranslationLoaderService);
  private localeService: LocaleService = this.injector.get(LocaleService);

  constructor(
    private injector: Injector,
    private peOverlayWidgetService: PeOverlayWidgetService,
    private readonly destroy$: PeDestroyService,
    private readonly route: ActivatedRoute,
    private readonly router: Router,
  ) {
  }

  ngOnInit(): void {
    const locale$ = this.route.queryParams.pipe(
      map(({ lang }) => lang),
    );

    this.localeService.locales$
      .pipe(
        switchMap(locales => locale$.pipe(
          tap((lang) => {
            this.locales = this.filterLocales(locales);
            const locale = this.locales.find(l => l.code === lang) ?? this.locales.find(l => l.code === retrieveLocale());
            this.currentLocale = locale ?? this.locales[0];
            localStorage.setItem('pe_current_locale', this.currentLocale.code);
          }),
        )),
        takeUntil(this.destroy$),
      ).subscribe();
  }

  changeLocale(locale: LocaleInterface): void {
    if (this.reloadPageOnSwitch) {
      this.localeService.changeCurrentLocale(locale.code);
    } else {
      this.localeService.currentLocale$.next(locale);
      this.translationLoaderService.reloadTranslations(locale.code).subscribe(() => {
        this.localeChanged.emit();
        this.router.navigate(['.'], { queryParams: null, relativeTo: this.route });
      });
    }
  }

  openOverlay(): void {
    const onSaveSubject$ = new BehaviorSubject<any>(null);
    const peOverlayConfig: PeOverlayConfig = {
      data: {
        currentLocale: this.currentLocale,
        locales: this.locales,
      },
      headerConfig: {
        hideHeader: true,
        title: '',
        theme: 'dark',
        onSaveSubject$: onSaveSubject$,
      },
      panelClass: 'pe-locale-switcher',
      component: CosLocaleListComponent,
      backdropClick: () => {
        return false;
      },
    };

    const peOverlayRef: PeOverlayRef = this.peOverlayWidgetService.open(peOverlayConfig);

    onSaveSubject$.pipe(
      skip(1),
      take(1),
      tap((locale) => {
        if (locale && locale.code !== this.currentLocale.code) {
          this.changeLocale(locale);
        }

        peOverlayRef.close();
      }),
    ).subscribe();
  }

  private filterLocales(locales: LocaleInterface[]): LocaleInterface[] {
    if (this.allowedLocales && this.allowedLocales.length > 0) {
      locales = locales.filter(a => this.allowedLocales.indexOf(a.code) >= 0);
    }

    return locales;
  }
}
