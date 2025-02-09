import { Component, EventEmitter, Injector, Input, OnDestroy, Output, ViewChild } from '@angular/core';
import { MatMenuTrigger } from '@angular/material/menu';
import { ReplaySubject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import { LocaleService } from '../../services';
import { LocaleInterface } from '../../interfaces';
import { retrieveLocale } from '../../lib';
import { TranslationLoaderService } from '../../services/translation-loader';

@Component({
  selector: 'pe-locales-switcher',
  templateUrl: './locales-switcher.component.html',
  styleUrls: ['./locales-switcher.component.scss']
})
export class LocalesSwitcherComponent implements OnDestroy {

  @Input() transparent: boolean = false;
  @Input() dark: boolean = false;
  @Input() reloadPageOnSwitch: boolean = true;
  @Input() allowedLocales: string[] = null;

  @Output() localeChanged: EventEmitter<void> = new EventEmitter<void>();

  locales: LocaleInterface[] = [];
  currentLocale: LocaleInterface;

  // Need for tests
  @ViewChild('matMenuTrigger') matMenuTrigger: MatMenuTrigger;

  private destroyed$: ReplaySubject<boolean> = new ReplaySubject();

  private translationLoaderService: TranslationLoaderService = this.injector.get(TranslationLoaderService);
  private localeService: LocaleService = this.injector.get(LocaleService);

  constructor(
    private injector: Injector
  ) {}

  ngOnInit(): void {
    this.localeService.locales$
      .pipe(takeUntil(this.destroyed$))
      .subscribe(
        locales => {
          // We can't take current locale from this.localeService.currentLocale$ because
          // locale can be changed directly by other micro that is not reflected in currentLocale$
          const lang: string = retrieveLocale();
          this.locales = this.filterLocales(locales);
          this.currentLocale = locales.find(a => a.code === lang) || locales[0];
        }
      );
  }

  ngOnDestroy(): void {
    this.destroyed$.next(true);
    this.destroyed$.complete();
  }

  changeLocale(locale: LocaleInterface): void {
    if (this.reloadPageOnSwitch) {
      this.localeService.changeCurrentLocale(locale.code);
    } else {
      this.localeService.currentLocale$.next(locale);
      this.translationLoaderService.reloadTranslations(locale.code).subscribe(() => {
        this.localeChanged.emit();
      });
    }
  }

  private filterLocales(locales: LocaleInterface[]): LocaleInterface[] {
    if (this.allowedLocales && this.allowedLocales.length > 0) {
      locales = locales.filter(a => this.allowedLocales.indexOf(a.code) >= 0);
    }
    return locales;
  }
}
