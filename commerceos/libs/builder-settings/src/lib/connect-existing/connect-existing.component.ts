import { ChangeDetectionStrategy, ChangeDetectorRef, Component, Inject } from '@angular/core';
import { switchMap } from 'rxjs/operators';

import { PeAppEnv } from '@pe/app-env';
import { PebAppsApi } from '@pe/builder/api';
import { PE_OVERLAY_CONFIG, PE_OVERLAY_DATA, PeOverlayWidgetService } from '@pe/overlay-widget';


@Component({
  selector: 'pe-connect-existing',
  templateUrl: './connect-existing.component.html',
  styleUrls: ['./connect-existing.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PeSettingsConnectExistingComponent {
  domainName = '';
  domainId: string;
  errorMsg: string;
  error: string;
  isConnected: boolean;
  domainInfo = {
    currentIp: '',
    requiredIp: '',
    currentValue: '',
    requiredValue: '',
  };

  step = 1;

  constructor(
    public appEnv: PeAppEnv,
    private apiShop: PebAppsApi,
    @Inject(PE_OVERLAY_DATA) private appData: any,
    @Inject(PE_OVERLAY_CONFIG) public config: any,
    private overlay: PeOverlayWidgetService,
    private cdr: ChangeDetectorRef,
  ) {
    this.config.doneBtnCallback = () => {
      this.resetDomain();
    };
    appData.closeEvent.subscribe((closed) => {
      if (closed) {
        this.resetDomain();
      }
    });
  }

  private resetDomain() {
    if (!this.domainId || this.isConnected) {
      this.overlay.close();

      return;
    }
    this.apiShop.deleteDomain(this.appData.id, this.domainId).subscribe(data => this.overlay.close());
  }

  validateDomain(event) {
    const value = event.target.value;
    this.domainName = value;
    this.error = '';
    if (!this.validateName(value)) {
      this.error = value.length < 3 ? 'Domain should have at least 3 characters' : 'Domain name is not correct';
      this.cdr.markForCheck();

      return;

    }

    if (!value) {
      this.error = 'Domain can not be empty';
    }
    this.cdr.markForCheck();
  }

  validateName(name: string) {
    return /^[a-zA-Z0-9'+.][a-zA-Z0-9-+.]{1,61}[a-zA-Z0-9]+$/.test(name);
  }

  verify() {
    if (!this.domainName) {
      return;
    }
    this.apiShop.addDomain(this.appData.id, this.domainName).pipe(
      switchMap((data) => {
        this.domainId = data._id;

        return this.apiShop.checkDomain(this.appData.id, data._id);
      }),
    ).subscribe((info) => {
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
      fields = fields + 'A ';
    }
    if (info.currentValue !== info.requiredValue){
      if (fields.length) {
        fields += '& CNAME'
      } else {
        fields += 'CNAME'
      }
    }

    return `${fields} `;
  }
}
