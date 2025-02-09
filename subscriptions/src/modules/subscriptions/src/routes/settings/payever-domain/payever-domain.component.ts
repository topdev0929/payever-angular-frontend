import { ChangeDetectionStrategy, ChangeDetectorRef, Component, Inject, OnInit } from '@angular/core';

import { PeOverlayWidgetService, PE_OVERLAY_CONFIG, PE_OVERLAY_DATA } from '@pe/overlay-widget';

import { AbstractComponent } from '../../../shared/abstract';
import { PeSettingsApi } from '../../../api/settings/abstract.settings.api';

@Component({
  selector: 'peb-payever-domain',
  templateUrl: './payever-domain.component.html',
  styleUrls: ['./payever-domain.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PeSettingsPayeverDomainComponent extends AbstractComponent implements OnInit {
  errorMsg: string;

  domainConfig = {
    domainName: '',
    provider: 'payever',
    creationDate: '10/01/2020',
  };

  constructor(
    @Inject(PE_OVERLAY_DATA) private appData: any,
    @Inject(PE_OVERLAY_CONFIG) public config: any,
    private overlay: PeOverlayWidgetService,
    private cdr: ChangeDetectorRef,
    private settingsApi: PeSettingsApi,
  ) {
    super();
    this.config.doneBtnCallback = () => {
      if (!this.errorMsg) {
        if (this.appData.internalDomain !== this.domainConfig.domainName) {
          this.settingsApi
            .updateBillingSubscriptionAccessConfig(this.appData.id, { internalDomain: this.domainConfig.domainName })
            .subscribe((data) => {
              this.appData.onSved$.next({ updateSubscriptionAccess: true });
              this.overlay.close();
            });
        } else {
          this.overlay.close();
        }
      }
    };
  }

  ngOnInit() {
    this.domainConfig.domainName = this.appData.internalDomain;
    this.domainConfig.creationDate = this.appData.createdAt;
  }

  validateDomain(value) {
    this.domainConfig.domainName = value;
    if (!this.validateName(value)) {
      this.errorMsg = value.length < 3 ? 'Domain name should have at least 3 characters' : 'Domain name is not correct';
      this.cdr.markForCheck();
      return;
    }

    this.settingsApi.validDomain(value).subscribe((data) => {
      this.errorMsg = data.message ? data.message : null;
      this.cdr.markForCheck();
    });

    if (!value) {
      this.errorMsg = 'Domain can not be empty';
    }
    this.cdr.markForCheck();
  }

  validateName(name: string) {
    return /^[a-zA-Z0-9][a-zA-Z0-9-]{1,61}[a-zA-Z0-9]$/.test(name);
  }
}
