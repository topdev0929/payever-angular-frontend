import { ChangeDetectionStrategy, Component, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

import { MessageBus } from '@pe/common';

import { PeBuilderHeaderMenuActionsEnum } from '../enums';
import { PeBuilderHeaderMenuDataInterface, PeBuilderHeaderMenuOptionInterface } from "../interfaces";

@Component({
  selector: 'pe-builder-header-menu',
  templateUrl: './builder-header-menu.component.html',
  styleUrls: ['./builder-header-menu.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PeBuilderHeaderMenuComponent {
  public actionPublish = this.menuData.action === PeBuilderHeaderMenuActionsEnum.SetBuilderPublish;

  constructor(
    @Inject(MAT_DIALOG_DATA) public menuData: PeBuilderHeaderMenuDataInterface,
    public dialogRef: MatDialogRef<PeBuilderHeaderMenuComponent>,
    private messageBus: MessageBus,
  ) {
  }

  public onCloseClick(): void {
    this.dialogRef.close();
  }

  public setValue(value: PeBuilderHeaderMenuOptionInterface): void {
    this.messageBus.emit(this.menuData.action, value);
    this.dialogRef.close();
  }
}
