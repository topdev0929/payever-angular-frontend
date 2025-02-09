import { Component, Inject, Injector, OnInit, ViewEncapsulation } from '@angular/core';
import { cloneDeep } from 'lodash-es';
import { takeUntil } from 'rxjs/operators';

import { TranslateService } from '@pe/i18n';
import { PE_OVERLAY_DATA } from '@pe/overlay-widget';

import { RootCheckoutWrapperService, StorageService } from '../../../services';
import { CheckoutSettingsInterface, LanguageInterface } from '../../../interfaces';
import { BaseSettingsComponent } from '../base-settings.component';

@Component({
  selector: 'checkout-language',
  templateUrl: './language.component.html',
  styleUrls: ['./language.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class LanguageComponent extends BaseSettingsComponent implements OnInit {

  languagePanel: LanguageInterface[];
  checkoutUuid = this.overlayData.checkoutUuid;
  onSave$ = this.overlayData.onSave$.pipe(takeUntil(this.destroyed$));
  onClose$ = this.overlayData.onClose$.pipe(takeUntil(this.destroyed$));

  constructor(
    injector: Injector,
    private wrapperService: RootCheckoutWrapperService,
    private storageService: StorageService,
    public translateService: TranslateService,
    @Inject(PE_OVERLAY_DATA) public overlayData: any
  ) {
    super(injector);
  }

  ngOnInit() {
    super.ngOnInit();
    this.onSave$.subscribe(() => {
      if (this.languagePanel) {
        this.goBack();
        this.overlayData.close();
      }
    });

    this.onClose$.subscribe(() => {
      if (this.languagePanel) {
        this.overlayData.close();
      }
    });
    this.parseLanguages();
  }

  setDefaultLanguage(languageDefault: LanguageInterface) {
    this.languagePanel.map(language => {
      if (language.isDefault) {
        language.isDefault = false;
      }
    });
    languageDefault.isDefault = true;
    languageDefault.active = true;
  }

  goBack() {
    // TODO Saving on Back is not good idea
    this.storageService.getCheckoutByIdOnce(this.checkoutUuid).subscribe(currentCheckout => {
      const newSettings: CheckoutSettingsInterface = {...currentCheckout.settings, languages: this.languagePanel};

      this.storageService.saveCheckoutSettings(currentCheckout._id, newSettings)
        .subscribe(() => {
          this.wrapperService.onSettingsUpdated();
        }, err => {
          this.showError(err.message || 'Not possible to save languages! Unknown error!');
        });
    });
  }

  toggleClick(item) {
    const active = this.languagePanel.find(language => language.active === true);
    this.languagePanel.map(language => {
      if (language.name === item) {
        language.active = !language.active;
        language.isDefault = !active;
      }
    });
  }

  private parseLanguages(): void {
    this.storageService.getCheckoutByIdOnce(this.checkoutUuid).subscribe(currentCheckout => {
      const languages = cloneDeep(currentCheckout.settings.languages);
      languages.forEach(language => {
        language.isToggleButton = true;
        language.isHovered = false;
      });
      this.languagePanel = languages;
    }, err => {
      this.showError(err.message);
    });
  }
}
