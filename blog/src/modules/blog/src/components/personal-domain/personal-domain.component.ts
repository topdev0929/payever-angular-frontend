import { ChangeDetectionStrategy, ChangeDetectorRef, Component, Inject, OnInit } from '@angular/core';

import { PebBlogsApi } from '@pe/builder-api';
import { PeOverlayWidgetService, PE_OVERLAY_CONFIG, PE_OVERLAY_DATA, } from '@pe/overlay-widget';

@Component({
  selector: 'peb-personal-domain',
  templateUrl: './personal-domain.component.html',
  styleUrls: ['./personal-domain.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PeSettingsPersonalDomainComponent implements OnInit {
  isloading;
  domainList: any[];

  constructor(
    private apiBlog: PebBlogsApi,
    @Inject(PE_OVERLAY_DATA) private appData: any,
    @Inject(PE_OVERLAY_CONFIG) public config: any,
    private overlay: PeOverlayWidgetService,
    private cdr: ChangeDetectorRef,
  ) {
    this.config.doneBtnCallback = () => {
      this.overlay.close();
    }

  }

  ngOnInit() {
    console.log('PeSettingsPersonalDomainComponent ', this.appData);
    this.isloading = true;
    this.apiBlog.getAllDomains(this.appData._id).subscribe(domains => {
      this.domainList = domains;
      this.isloading = false;
      this.cdr.markForCheck();

    })
  }

  removeDomain(domain, i) {
    this.apiBlog.deleteDomain(this.appData._id, domain.id).subscribe(data => {
      this.domainList.splice(i, 1);
      this.cdr.markForCheck();
    })
  }

  addDomain() {
    this.overlay.close();
    this.appData.onSved$.next({ connectExisting: true });
  }
}
