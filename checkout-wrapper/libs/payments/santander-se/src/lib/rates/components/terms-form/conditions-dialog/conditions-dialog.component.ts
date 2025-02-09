import { Component, OnInit, Inject } from '@angular/core';

import { DialogRef, DialogComponentInterface, DIALOG_DATA } from '@pe/checkout/dialog';
import { PluginEventsService } from '@pe/checkout/plugins';

export interface ConditionsDialogDataInterface {
  code: string;
  flowId: string;
}

@Component({
  selector: 'santander-se-conditions-dialog',
  templateUrl: 'conditions-dialog.component.html',
})
export class ConditionsDialogComponent implements OnInit, DialogComponentInterface {

  dialogRef: DialogRef<ConditionsDialogComponent>;

  public get translations() {
    return {
      fullText: $localize `:@@santander-se.inquiry.form.accept_conditions.details.full_text:`,
    };
  }

  private data: ConditionsDialogDataInterface = null;

  constructor(
    private pluginEventsService: PluginEventsService,
    @Inject(DIALOG_DATA) public baseData: ConditionsDialogDataInterface
  ) {
    this.data = baseData;
  }

  ngOnInit(): void {
    this.pluginEventsService.emitModalShow(this.data.flowId);
  }
}
