import { Injectable } from '@angular/core';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';

import { PebEditorScriptsDialog } from './scripts.dialog';


@Injectable()
export class PebEditorScriptsDialogService {

  constructor(
    private dialog: MatDialog,    
  ) {
  }

  openScriptsDialog(): MatDialogRef<PebEditorScriptsDialog> {
    return this.dialog.open(PebEditorScriptsDialog, {
      panelClass: ['scripts-dialog__panel'],
      width: '436px',
    });
  }
}
