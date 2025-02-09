import { ChangeDetectionStrategy, ChangeDetectorRef, Component, Inject } from '@angular/core';
import { switchMap } from 'rxjs/operators';

import { PeOverlayWidgetService, PE_OVERLAY_CONFIG } from '@pe/overlay-widget';

import { AbstractComponent } from '../../../shared/abstract';
import { PeSettingsApi } from '../../../api/settings/abstract.settings.api';

@Component({
  selector: 'peb-connect-existing',
  templateUrl: './connect-existing.component.html',
  styleUrls: ['./connect-existing.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PeSettingsConnectExistingComponent extends AbstractComponent {
  domainName: string;
  domainId: string;
  errorMsg: string;
  isConnected: boolean;
  domainInfo = {
    currentIp: '',
    requiredIp: '',
    currentValue: '',
    requiredValue: '',
  };
  step = 1;

  constructor(
    @Inject(PE_OVERLAY_CONFIG) public config: any,
    private overlay: PeOverlayWidgetService,
    private cdr: ChangeDetectorRef,
    private settingsApi: PeSettingsApi,
  ) {
    super();
    this.config.doneBtnCallback = this.config.backBtnCallback = () => {
      if (!this.domainId || this.isConnected) {
        this.overlay.close();
        return;
      }
    };
  }

  verify() {
    if (!this.domainName) {
      return;
    }

    this.settingsApi
      .addDomain(this.domainName)
      .pipe(
        switchMap((data) => {
          this.domainId = data.id;
          return this.settingsApi.checkDomain(this.domainId);
        }),
      )
      .subscribe(
        (info) => {
          this.step = 2;
          this.domainInfo.currentIp = info.currentIp;
          this.domainInfo.requiredIp = info.requiredIp;
          this.domainInfo.currentValue = info.currentCname;
          this.domainInfo.requiredValue = info.requiredCname;
          this.isConnected = info.isConnected;
          this.cdr.detectChanges();
        },
        (error) => {
          this.errorMsg = error.error.message;
          this.cdr.detectChanges();
        },
      );
  }

  connect() {
    this.overlay.close();
  }

  getfields(info) {
    let fields = '';
    if (info.currentIp !== info.requiredIp) {
      fields = `${fields}'A '}`;
    }

    return fields;
  }
}
