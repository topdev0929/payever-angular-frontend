import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';

import { DialogRef, DialogComponentInterface } from '@pe/checkout/dialog';
import { PluginEventsService } from '@pe/checkout/plugins';

export interface DataInterface {
  flowId: string;
  title?: string;
  text: string;
}

@Component({
  selector: 'checkout-sdk-default-dialog',
  templateUrl: 'default-dialog.component.html',
  styleUrls: ['./default-dialog.component.scss'],
})
export class DefaultDialogComponent implements OnInit, DialogComponentInterface {

  dialogRef: DialogRef<DefaultDialogComponent>;

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: DataInterface,
    private pluginEventsService: PluginEventsService
  ) {
  }

  ngOnInit(): void {
    this.pluginEventsService.emitModalShow(this.data.flowId);
  }
}
