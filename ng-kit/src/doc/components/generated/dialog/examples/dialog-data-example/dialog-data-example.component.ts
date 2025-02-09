import { Component, Inject } from '@angular/core';
import { FormControl } from '@angular/forms';

import { DialogService, DIALOG_DATA, DialogRef, DialogComponentInterface, DialogConfigPresetName } from '../../../../../../kit/dialog';

@Component({
  selector: 'doc-dialog-data-example',
  templateUrl: 'dialog-data-example.component.html'
})
export class DialogDataExampleDocComponent {

  animal: string;
  nameFormControl: FormControl = new FormControl('');

  constructor(private dialogService: DialogService) {
  }

  openDialog(): void {
    const dialogRef: DialogRef<DialogContentDataExampleDocComponent, string> = this.dialogService.open(
      DialogContentDataExampleDocComponent,
      DialogConfigPresetName.Small,
      { name: this.nameFormControl.value, animal: this.animal }
    );

    dialogRef.afterClosed().subscribe((result: string) => {
      
      this.animal = result;
    });
  }
}

@Component({
  selector: 'doc-dialog-content-data-example',
  template: `
    <pe-dialog [title]="'Hi ' + data.name">
      <pe-dialog-content>
        <p>What's your favorite animal?</p>
        <pe-input ngDefaultControl [formControlRef]="formControl"></pe-input>
      </pe-dialog-content>
      <pe-dialog-actions>
        <button mat-button class="mat-button-link mat-button-bold" color="primary" [dialogClose]="formControl.value">Ok</button>
      </pe-dialog-actions>
    </pe-dialog>
  `,
  styles: [`
    ::ng-deep pe-input .mat-form-field {
      display: block;
      width: 100%;
    }
  `]
})
export class DialogContentDataExampleDocComponent implements DialogComponentInterface {

  dialogRef: DialogRef<DialogContentDataExampleDocComponent>;
  formControl: FormControl = new FormControl();

  constructor(@Inject(DIALOG_DATA) public data: any) {
  }
}
