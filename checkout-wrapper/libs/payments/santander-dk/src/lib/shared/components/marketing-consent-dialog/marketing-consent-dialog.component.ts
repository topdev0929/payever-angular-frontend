import { Component, OnInit, Inject } from '@angular/core';

import { DialogRef, DialogComponentInterface, DIALOG_DATA } from '@pe/checkout/dialog';
import { PluginEventsService } from '@pe/checkout/plugins';

@Component({
  selector: 'santander-dk-marketing-consent-dialog',
  templateUrl: 'marketing-consent-dialog.component.html',
})
export class MarketingConsentDialogComponent implements OnInit, DialogComponentInterface {

  dialogRef: DialogRef<MarketingConsentDialogComponent>;

  marketingConsentDetailsText = $localize `:@@santander-dk.inquiry.form.marketing_consent.details.text:`;

  constructor(
    @Inject(DIALOG_DATA) public data: any,
    private pluginEventsService: PluginEventsService
  ) {
  }

  ngOnInit(): void {
    this.pluginEventsService.emitModalShow(this.data.flowId);
  }
}
