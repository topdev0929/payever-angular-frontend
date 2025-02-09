import { ChangeDetectionStrategy, Component, Inject, Input, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialog, MatDialogRef } from '@angular/material/dialog';
import { Store } from '@ngxs/store';

import { DEFAULT_TRIGGER_POINT, pebGenerateId, PebScript, PebScriptTrigger } from '@pe/builder/core';
import { PebDeleteScriptsAction, PebPagesState, PebUpdateScriptsAction } from '@pe/builder/state';

export interface PebEditorScriptFormValue extends PebScript {
  page: string;
}

@Component({
  selector: 'peb-script-form',
  templateUrl: './script-form.dialog.html',
  styleUrls: ['./script-form.dialog.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PebEditorScriptFormDialog implements OnInit {

  @Input() title = 'Add script';
  @Input() script: PebScript;

  @ViewChild('confirmDialogTpl') confirmDialogTpl: TemplateRef<any>;
  confirmDialogRef: MatDialogRef<any>;

  readonly form = this.fb.group({
    id: [],
    name: this.fb.control('', { validators: [Validators.required] }),
    content: this.fb.control('', { validators: [Validators.required] }),
    triggerPoint: this.fb.control(''),
    page: [],
    isEnable: [],
    needPermission: [],
  });

  readonly pageOptions = [
    { name: 'Global', value: '' },
     ...this.store.selectSnapshot(PebPagesState.pages).map(p => ({ name: `Page: ${p.name}`, value: p.id })),
  ];

  readonly triggerPointOptions = [
    { name: 'Page View', value: PebScriptTrigger.PageView },
    { name: 'DOM Ready', value: PebScriptTrigger.DOMReady },
    { name: 'Window Loaded', value: PebScriptTrigger.WindowLoaded },
  ];

  constructor(
    private dialogRef: MatDialogRef<PebEditorScriptFormDialog>,
    @Inject(MAT_DIALOG_DATA) public data: { script?: PebScript },    
    private fb: FormBuilder,
    private dialog: MatDialog,
    private store: Store,
  ) {
  }

  ngOnInit(): void {
    this.form.patchValue({
      id: pebGenerateId(),
      isEnable: true,
      needPermission: false,
      page: '',      
      triggerPoint: DEFAULT_TRIGGER_POINT,
      ...this.data?.script,
    });
  }

  submitForm(): void {
    if (this.form.valid) {
      const script = { isEnable: true, ...this.form.value };
      this.store.dispatch(new PebUpdateScriptsAction(script));
      this.dialogRef.close(this.form.value);
    }
  }

  closeForm() {
    this.confirmDialogRef = this.dialog.open(this.confirmDialogTpl, {
      panelClass: ['scripts-dialog__panel'],
      maxWidth: '300px',
    });
    this.confirmDialogRef.afterClosed().subscribe((ans) => {
      if (ans) {
        this.dialogRef.close();
      }
      this.confirmDialogRef = undefined;
    });    
  }

  removeScript(): void {
    this.store.dispatch(new PebDeleteScriptsAction(this.form.value.id));
    this.dialogRef.close();
  }
}
