import { Injectable } from '@angular/core';

import { DialogRef, DialogService } from '@pe/checkout/dialog';
import { FlowInterface } from '@pe/checkout/types';

import { ShareBagComponent } from '../components';
import { SHARE_DIALOG_SIZE } from '../constants';


@Injectable()
export class ShareBagDialogService {
  constructor(
    private dialogService: DialogService,
  ) {}

  open(flow: FlowInterface, openNextStep: boolean): DialogRef<ShareBagComponent> {
    const dialogRef = this.dialogService.open(
      ShareBagComponent,
      null,
      { flow, openNextStep },
      'share-dialog',
      {
        width: `${SHARE_DIALOG_SIZE[0]}px`,
        height: `${SHARE_DIALOG_SIZE[1]}px`,
      },
    );

    return dialogRef;
  }

  close(): void {
    this.dialogService.closeAll();
  }
}
