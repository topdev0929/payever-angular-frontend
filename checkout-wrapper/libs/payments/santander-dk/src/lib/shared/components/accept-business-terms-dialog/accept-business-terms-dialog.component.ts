import { Component, Inject, OnInit } from '@angular/core';

import { DialogRef, DialogComponentInterface, DIALOG_DATA } from '@pe/checkout/dialog';
import { PluginEventsService } from '@pe/checkout/plugins';

@Component({
  selector: 'santander-dk-accept-business-terms-dialog',
  templateUrl: 'accept-business-terms-dialog.component.html',
})
export class AcceptBusinessTermsDialogComponent implements OnInit, DialogComponentInterface {

  dialogRef: DialogRef<AcceptBusinessTermsDialogComponent>;
  businessTermsDetailsText = $localize `:@@santander-dk.inquiry.form.accept_business_terms.details.text:`;

  constructor(
    @Inject(DIALOG_DATA) public data: any,
    private pluginEventsService: PluginEventsService
  ) {
  }

  ngOnInit(): void {
    this.pluginEventsService.emitModalShow(this.data.flowId);
  }
}
