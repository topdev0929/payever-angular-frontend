import { Component, Inject } from '@angular/core';

import { LocaleService } from '../../../../../../kit/i18n/src/services/locale/locale.service';
import { I18N_CONFIG } from '../../../../../../kit/i18n/src/constants';
import { I18nConfig } from '../../../../../../kit/i18n/src/interfaces';

@Component({
  selector: 'doc-locales-switcher-example',
  templateUrl: 'locales-switcher-example.component.html'
})
export class LocalesSwitcherExampleDocComponent {

  constructor(
    @Inject(I18N_CONFIG) private i18nConfig: I18nConfig,
    private localeService: LocaleService
  ) {
  }

  get useStorageForLocale(): boolean {
    return this.i18nConfig.useStorageForLocale;
  }

  set useStorageForLocale(use: boolean) {
    this.i18nConfig.useStorageForLocale = use;
    this.localeService.updateConfig();
  }
}
