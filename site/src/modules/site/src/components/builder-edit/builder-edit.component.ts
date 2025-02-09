import { Component, OnInit } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';

import { MessageBus } from '@pe/common';

import { EDIT_OPTION } from '../../constants';

@Component({
  selector: 'pe-shop-builder-edit',
  templateUrl: './builder-edit.component.html',
  styleUrls: ['./builder-edit.component.scss'],
})
export class PeSiteBuilderEditComponent implements OnInit {

  readonly options = EDIT_OPTION;

  constructor(
    private dialogRef: MatDialogRef<PeSiteBuilderEditComponent>,
    private messageBus: MessageBus,
  ) { }

  ngOnInit(): void {
  }

  onCloseClick() {
    this.dialogRef.close();
  }

  setValue(item) {
    this.messageBus.emit('site.set.builder_edit', item.option);
    this.dialogRef.close();
  }
}
