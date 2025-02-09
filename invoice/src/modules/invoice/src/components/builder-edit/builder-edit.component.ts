import { Component, OnInit } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';

import { MessageBus } from '@pe/common';

import { EDIT_OPTION } from '../../constants';

@Component({
  selector: 'pe-invoice-builder-edit',
  templateUrl: './builder-edit.component.html',
  styleUrls: ['./builder-edit.component.scss'],
})
export class PeInvoiceBuilderEditComponent implements OnInit {

  readonly options = EDIT_OPTION;

  constructor(
    private dialogRef: MatDialogRef<PeInvoiceBuilderEditComponent>,
    private messageBus: MessageBus,
  ) { }

  ngOnInit(): void {
  }

  onCloseClick() {
    this.dialogRef.close();
  }

  setValue(item) {
    this.messageBus.emit('invoice.set.builder_edit', item.option);
    this.dialogRef.close();
  }
}
