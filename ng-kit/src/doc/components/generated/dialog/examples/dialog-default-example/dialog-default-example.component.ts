import { Component } from '@angular/core';
import { FormControl } from '@angular/forms';

import { DialogService, DialogRef, DialogComponentInterface, DialogButtonListInterface, DialogConfigPresetName } from '../../../../../../kit/dialog';

@Component({
  selector: 'doc-dialog-default-example',
  templateUrl: 'dialog-default-example.component.html'
})
export class DialogDefaultExampleDocComponent {

  animal: string;
  nameFormControl: FormControl = new FormControl('');

  constructor(private dialogService: DialogService) {
  }

  openDialog(): void {
    const dialogRef: DialogRef<DialogContentDefaultExampleDocComponent, string> = this.dialogService.open(
      DialogContentDefaultExampleDocComponent,
      DialogConfigPresetName.Small
    );

    dialogRef.afterClosed().subscribe(() => {
      
    });
  }
}

@Component({
  selector: 'doc-dialog-content-default-example',
  template: `
    <pe-dialog [baseButtons]="'close'" [buttons]="buttons">
      <pe-dialog-content>
        <div class="dialog-container">
          <p>Please select the date of your previous employment</p>
          <div>
            <svg class="icon icon-32"><use xlink:href="#icon-alert-32"></use></svg>
          </div>
        </div>
      </pe-dialog-content>
    </pe-dialog>
  `,
  styleUrls: ['dialog-default-example.component.scss']
})
export class DialogContentDefaultExampleDocComponent implements DialogComponentInterface {

  buttons: DialogButtonListInterface = {
    save: {
      classes: 'mat-button-bold',
      color: 'primary',
      text: 'Try again',
      order: 2,
      click: () => {
        alert('"Try again" was clicked');
        this.dialogRef.close();
      }
    }
  };
  dialogRef: DialogRef<DialogContentDefaultExampleDocComponent>;

  constructor() {
  }
}
