import { ChangeDetectionStrategy, Component } from '@angular/core';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';

import { PebEditorIntegrationConnectDialog } from '@pe/builder/main-editor';

export const THEME_OPTION = [
  {
    title: 'Connect',
    disabled: false,
    active: false,
    image: '/assets/builder-app/icons/connect.svg',
    option: 'openConnect',
  },
];

@Component({
  selector: 'pe-shop-builder-integration',
  templateUrl: './builder-integration.component.html',
  styleUrls: ['./builder-integration.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PeShopBuilderIntegrationComponent {
  readonly options = THEME_OPTION;

  constructor(private dialogRef: MatDialogRef<PeShopBuilderIntegrationComponent>, private dialog: MatDialog) {}

  onCloseClick() {
    this.dialogRef.close();
  }

  setValue(item) {
    if (item.option === 'openConnect') {
      this.dialog.open(PebEditorIntegrationConnectDialog, {
        panelClass: ['connect-dialog__panel'],
        width: '435px',
      });
    }

    this.dialogRef.close();
  }
}
