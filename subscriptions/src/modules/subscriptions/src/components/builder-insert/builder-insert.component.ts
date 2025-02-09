import { Component, OnInit } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';

import { MessageBus } from '@pe/common';

import { INSERT_OPTION } from '../../constants';

@Component({
  selector: 'pe-builder-insert',
  templateUrl: './builder-insert.component.html',
  styleUrls: ['./builder-insert.component.scss'],
})
export class PebSubscriptionBuilderInsertComponent implements OnInit {

  readonly options = INSERT_OPTION;
  constructor(
    private dialogRef: MatDialogRef<PebSubscriptionBuilderInsertComponent>,
    private messageBus: MessageBus,
  ) { }

  ngOnInit(): void {
  }

  onCloseClick() {
    this.dialogRef.close();
  }

  setValue(item) {
    this.messageBus.emit('subscription.set.builder_insert', { type: item.option, params: item.payload });
    this.dialogRef.close();
  }
}
