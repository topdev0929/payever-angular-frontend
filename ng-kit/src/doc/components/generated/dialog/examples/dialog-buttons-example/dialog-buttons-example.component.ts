import { Component, Inject } from '@angular/core';
import { FormControl } from '@angular/forms';
import { BehaviorSubject } from 'rxjs';

import { DialogService, DIALOG_DATA, DialogButtonListInterface, DialogRef, DialogComponentInterface, DialogConfigPresetName, DialogActions } from '../../../../../../kit/dialog';

@Component({
  selector: 'doc-dialog-buttons-example',
  templateUrl: 'dialog-buttons-example.component.html'
})
export class DialogButtonsExampleDocComponent {

  animal: string;
  nameFormControl: FormControl = new FormControl('');

  constructor(private dialogService: DialogService) {
  }

  openDialog(): void {
    const dialogRef: DialogRef<DialogContentButtonsExampleDocComponent, string> = this.dialogService.open(
      DialogContentButtonsExampleDocComponent,
      DialogConfigPresetName.Small,
      { name: this.nameFormControl.value, animal: this.animal }
    );

    dialogRef.afterClosed().subscribe((result: string) => {
      
      this.animal = result;
    });
  }
}

@Component({
  selector: 'doc-dialog-content-buttons-example',
  template: `
    <pe-dialog [title]="'Hi ' + data.name" [baseButtons]="'close'" [buttons]="buttons">
      <pe-dialog-content>
        <p>What's your favorite animal?</p>
        <pe-input ngDefaultControl [formControlRef]="formControl"></pe-input>
      </pe-dialog-content>
    </pe-dialog>
  `,
  styles: [`
    ::ng-deep pe-input .mat-form-field {
      display: block;
      width: 100%;
    }
  `]
})
export class DialogContentButtonsExampleDocComponent implements DialogComponentInterface {

  formControl: FormControl = new FormControl();
  dialogRef: DialogRef<DialogContentButtonsExampleDocComponent>;
  dialogResult: BehaviorSubject<string> = new BehaviorSubject<string>(null);

  buttons: DialogButtonListInterface = {
    save: {
      text: 'Save',
      click: DialogActions.Close,
      dialogResult: this.dialogResult,
      classes: 'mat-button-bold',
      color: 'primary'
    }
  };

  constructor(@Inject(DIALOG_DATA) public data: any) {
    this.formControl.valueChanges.subscribe((data: string) => {
      this.dialogResult.next(data);
    });
  }
}
