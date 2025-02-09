import { ChangeDetectionStrategy, ChangeDetectorRef, Component, Inject, OnInit } from '@angular/core';

import { PeOverlayWidgetService, PE_OVERLAY_CONFIG, PE_OVERLAY_DATA } from '@pe/overlay-widget';
import { EnvService } from '@pe/common';

import { AbstractComponent } from '../../../shared/abstract';
import { PeSettingsApi } from '../../../api/settings/abstract.settings.api';
import { SubscriptionEnvService } from '../../../api/subscription/subscription-env.service';

@Component({
  selector: 'peb-personal-domain',
  templateUrl: './personal-domain.component.html',
  styleUrls: ['./personal-domain.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PeSettingsPersonalDomainComponent extends AbstractComponent implements OnInit {
  isloading;
  domainList: any[];

  constructor(
    private settingsApi: PeSettingsApi,
    @Inject(PE_OVERLAY_DATA) private appData: any,
    @Inject(PE_OVERLAY_CONFIG) public config: any,
    private overlay: PeOverlayWidgetService,
    private cdr: ChangeDetectorRef,
    @Inject(EnvService) private envService: SubscriptionEnvService,
  ) {
    super();
    this.config.doneBtnCallback = () => {
      this.overlay.close();
    };
  }

  ngOnInit() {
    this.isloading = true;
    this.settingsApi.getAllDomains(this.envService.applicationId).subscribe((domains) => {
      this.domainList = domains;
      this.isloading = false;
      this.cdr.markForCheck();
    });
  }

  removeDomain(domain, i) {
    this.settingsApi.deleteDomain(domain.id).subscribe((data) => {
      this.domainList.splice(i, 1);
      this.cdr.markForCheck();
    });
  }

  addDomain() {
    this.overlay.close();
    this.appData.onSved$.next({ connectExisting: true });
  }
}
