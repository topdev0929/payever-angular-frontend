import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { AbstractComponentDirective } from '../../misc/abstract.component';
import { AppThemeEnum, PebEnvService } from '@pe/common';
import { WelcomeDialogService } from '../../components/welcome-dialog/welcome-dialog.service';

@Component({
  selector: 'peb-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class PebDashboardComponent extends AbstractComponentDirective implements OnInit {
  theme = this.envService.businessData?.themeSettings?.theme
    ? AppThemeEnum[this.envService.businessData?.themeSettings?.theme]
    : AppThemeEnum.default;
  constructor(
    private envService: PebEnvService,
    private welcomeDialogService: WelcomeDialogService,
  ) {
    super();
  }

  ngOnInit() {
    this.theme = AppThemeEnum.default;
    const startedAffiliate = localStorage.getItem('startedAffiliate');
    if (startedAffiliate === null || startedAffiliate !== 'true'){
      this.welcomeDialogService.open();
    }
  }
}
