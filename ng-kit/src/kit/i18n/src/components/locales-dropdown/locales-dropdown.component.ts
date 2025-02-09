
import { takeUntil } from 'rxjs/operators';
import { Component, Input, OnDestroy } from '@angular/core';
import { ReplaySubject } from 'rxjs';

import { LocaleService } from '../../services';
import { LocaleInterface } from '../../interfaces';
import { AbstractComponent } from '../../../../common/src/components/abstract.component';

/**
 * @deprecated Need to use pe-locales-switcher instead.
 */
@Component({
  selector: 'pe-locales-dropdown',
  templateUrl: './locales-dropdown.component.html',
  styleUrls: ['./locales-dropdown.component.scss']
})
export class LocalesDropdownComponent extends AbstractComponent {

  locales: LocaleInterface[];
  currentLocale: LocaleInterface;
  @Input() dropUp: boolean = false;

  constructor(private localeService: LocaleService) {
    super();
    this.localeService.locales$.pipe(
      takeUntil(this.destroyed$))
      .subscribe((locales: LocaleInterface[]) => {
        this.locales = locales;
      });
    this.localeService.currentLocale$.pipe(
      takeUntil(this.destroyed$))
      .subscribe((locale: LocaleInterface) => {
        this.currentLocale = locale;
      });
  }

  changeLocale(locale: LocaleInterface): void {
    this.localeService.changeCurrentLocale(locale.code);
  }
}
