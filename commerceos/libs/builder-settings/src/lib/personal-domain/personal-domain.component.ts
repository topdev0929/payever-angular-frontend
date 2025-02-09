import { ChangeDetectionStrategy, ChangeDetectorRef, Component, Inject, OnInit } from '@angular/core';

import { PeAppEnv } from '@pe/app-env';
import { PebAppsApi } from '@pe/builder/api';
import { PE_OVERLAY_CONFIG, PE_OVERLAY_DATA, PeOverlayWidgetService } from '@pe/overlay-widget';


@Component({
  selector: 'pe-personal-domain',
  templateUrl: './personal-domain.component.html',
  styleUrls: ['./personal-domain.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PeSettingsPersonalDomainComponent implements OnInit {
  isloading;
  domainList: any[];

  constructor(
    public appEnv: PeAppEnv,
    private apiShop: PebAppsApi,
    @Inject(PE_OVERLAY_DATA) private appData: any,
    @Inject(PE_OVERLAY_CONFIG) public config: any,
    private overlay: PeOverlayWidgetService,
    private cdr: ChangeDetectorRef,
  ) {
    this.config.doneBtnCallback = () => {
      this.overlay.close();
    };
  }

  ngOnInit() {
    this.isloading = true;
    this.apiShop.getAllDomains(this.appData.id).subscribe((domains) => {
      this.domainList = domains;
      this.isloading = false;
      this.cdr.markForCheck();

    });
  }

  removeDomain(domain, i) {
    this.apiShop.deleteDomain(this.appData.id, domain._id).subscribe((data) => {
      this.domainList.splice(i, 1);
      this.cdr.markForCheck();
    });
  }

  addDomain() {
    this.overlay.close();
    this.appData.onSaved$.next({ connectExisting: true });
  }
}
