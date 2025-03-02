import { Component } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { MatDialogRef } from '@angular/material/dialog';
import { map, share } from 'rxjs/operators';

import { PebEditorApi } from '@pe/builder-api';

import * as yaml from 'js-yaml';

@Component({
  selector: 'sandbox-viewer-selection-dialog',
  templateUrl: './viewer-selection.dialog.html',
  styleUrls: ['./viewer-selection.dialog.scss'],
})
export class SandboxViewerSelectionDialog {

  fixtures$ = this.loadYml('/fixtures/index.yml').pipe(
    share(),
  );

  constructor(
    private http: HttpClient,
    private api: PebEditorApi,
    private dialogRef: MatDialogRef<SandboxViewerSelectionDialog>,
  ) {}

  private loadYml(path) {
    return this.http.get(path, {
      responseType: 'text',
    }).pipe(
      map((content) => (yaml as any).safeLoad(content)),
    )
  }

  onNavigationClick() {
    this.dialogRef.close();
  }
}
