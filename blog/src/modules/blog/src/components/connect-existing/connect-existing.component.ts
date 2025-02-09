import { ChangeDetectionStrategy, ChangeDetectorRef, Component, Inject, OnInit } from '@angular/core';
import { switchMap } from 'rxjs/operators';

import { PebBlogsApi } from '@pe/builder-api';
import { PeOverlayWidgetService, PE_OVERLAY_CONFIG, PE_OVERLAY_DATA, } from '@pe/overlay-widget';
import { PeDestroyService } from '@pe/common';

@Component({
  selector: 'peb-connect-existing',
  templateUrl: './connect-existing.component.html',
  styleUrls: ['./connect-existing.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PeSettingsConnectExistingComponent implements OnInit {
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
    private apiBlog: PebBlogsApi,
    @Inject(PE_OVERLAY_DATA) private appData: any,
    @Inject(PE_OVERLAY_CONFIG) public config: any,
    private overlay: PeOverlayWidgetService,
    private cdr: ChangeDetectorRef,
  ) {
    this.config.doneBtnCallback = this.config.backBtnCallback = () => {
      if (!this.domainId || this.isConnected) {
        this.overlay.close();
        return;
      }
      this.apiBlog.deleteDomain(this.appData._id, this.domainId).subscribe(data => this.overlay.close());
    }
  }

  ngOnInit() {

  }

  verify() {
    if (!this.domainName) return;
    this.apiBlog.addDomain(this.appData._id, this.domainName).pipe(
      switchMap(data => {
        this.domainId = data.id;
        return this.apiBlog.checkDomain(this.appData._id, data.id);
      })
    ).subscribe(info => {
      this.step = 2
      this.domainInfo.currentIp = info.currentIp;
      this.domainInfo.requiredIp = info.requiredIp;
      this.domainInfo.currentValue = info.currentCname;
      this.domainInfo.requiredValue = info.requiredCname;
      this.isConnected = info.isConnected;
      this.cdr.detectChanges();
    },
      error => {
        this.errorMsg = error.error.message;
        this.cdr.detectChanges();
      }
    )

  }

  connect() {
    this.overlay.close();
  }

  getfields(info) {
    let fields = "";
    if (info.currentIp !== info.requiredIp) { fields = fields + "A " };
    (info.currentValue !== info.requiredValue) ? fields.length ? fields = fields + "& CNAME" : fields = fields + "CNAME" : null;
    return fields;

  }
}
