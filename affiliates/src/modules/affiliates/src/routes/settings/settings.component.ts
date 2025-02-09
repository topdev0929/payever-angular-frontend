import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { AbstractComponentDirective } from '../../misc/abstract.component';
import { AppThemeEnum, PebEnvService } from '@pe/common';
import { PebBrandingSettingComponent } from './brading-dialog/branding-dialog.component';
import { PebCustomDomainSettingComponent } from './custom-domain-dialog/custom-domain-dialog.component';
import { PebBankSettingComponent } from './bank-dialog/bank-dialog.component';
import { PebPaymentsSettingComponent } from './payments-dialog/payments-dialog.component';
import { PeOverlayConfig, PeOverlayWidgetService } from '@pe/overlay-widget';
@Component({
  selector: 'peb-settings',
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class PebSettingsComponent extends AbstractComponentDirective implements OnInit {  
  theme = this.envService.businessData?.themeSettings?.theme
    ? AppThemeEnum[this.envService.businessData?.themeSettings?.theme]
    : AppThemeEnum.default;
  constructor(
    private envService: PebEnvService,
    private overlay: PeOverlayWidgetService,
  ) {
    super();
  }

  ngOnInit() {
    this.theme = AppThemeEnum.default;
  }

  openBrandingDialog(){
    this.showDialog('Cancel', 'Branding', 'Done', PebBrandingSettingComponent);
  }

  openPaymentsDialog(){
    this.showDialog('Cancel', 'Payments', 'Done', PebPaymentsSettingComponent);
  }

  openCustomDomainDialog(){
    this.showDialog('Cancel', 'Custom domain', 'Save', PebCustomDomainSettingComponent);
  }

  openBankDialog(){
    this.showDialog('Cancel', 'Bank', 'Save', PebBankSettingComponent);
  }
  showDialog(backBtnTitle, title, doneBtnTitle, component) {
    const config: PeOverlayConfig = {
      component,
      data: { },
      hasBackdrop: true,
      backdropClass: 'settings-backdrop',
      panelClass: 'settings-widget-panel',
      headerConfig: {
        doneBtnTitle,
        title,
        backBtnTitle,
        backBtnCallback: () => {
          this.overlay.close();
        },
        doneBtnCallback: () => {
          this.overlay.close();
        },
        theme: this.theme,
      },
    };
    this.overlay.open(config);
  }
}
