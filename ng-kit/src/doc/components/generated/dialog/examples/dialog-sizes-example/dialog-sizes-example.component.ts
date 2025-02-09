import { Component } from '@angular/core';

import { DialogService, DialogRef, DialogComponentInterface, DialogConfigPresetName } from '../../../../../../kit/dialog';

@Component({
  selector: 'doc-dialog-sizes-example',
  templateUrl: 'dialog-sizes-example.component.html'
})
export class DialogSizesExampleDocComponent {

  constructor(private dialogService: DialogService) {
  }

  openDialog(configPresetName: string): void {
    const dialogRef: DialogRef<DialogContentSizesExampleDocComponent, string> = this.dialogService.open(
      DialogContentSizesExampleDocComponent,
      DialogConfigPresetName[configPresetName]
    );

    dialogRef.afterClosed().subscribe(() => {
      
    });
  }

  openMicroOverlayDialog(configPresetName: string): void {
    const dialogRef: DialogRef<DialogMicroOverlayExampleDocComponent, string> = this.dialogService.open(
      DialogMicroOverlayExampleDocComponent,
      DialogConfigPresetName[configPresetName]
    );

    dialogRef.afterClosed().subscribe(() => {
      
    });
  }
}

@Component({
  selector: 'doc-dialog-content-default-example',
  template: `
    <pe-dialog [title]="'Are you sure you want to close Penguin Records business?'" [baseButtons]="'cancelSave'" [loading]="loading">
      <pe-dialog-content>
        Nullam vitae odio eleifend, elementum diam in, semper tellus. Aenean porttitor nibh augue, nec malesuada dui semper quis. Nulla eu est lacus. Maecenas lacinia magna suscipit, vulputate tellus a, mollis odio. Nulla porttitor lectus ut nisi egestas, at efficitur libero bibendum. Curabitur malesuada ligula in consequat mattis. Nullam vel erat sit amet orci pharetra maximus eu a lacus. Vestibulum malesuada diam quis felis feugiat, a fermentum purus faucibus. Vivamus tristique tempor quam nec faucibus. Cras mollis diam dignissim nisi suscipit, id gravida nisi sollicitudin.
      </pe-dialog-content>
    </pe-dialog>
  `
})
export class DialogContentSizesExampleDocComponent implements DialogComponentInterface {

  dialogRef: DialogRef<DialogContentSizesExampleDocComponent>;
  loading: boolean = true;

  constructor() {
    setTimeout(() => {
      this.loading = false;
    }, 2000);
  }
}

@Component({
  selector: 'doc-dialog-micro-overlay-example',
  template: `
    <pe-dialog [loading]="loading" [hasToolbar]="true">
      <div toolbar>Back to dashboard</div>
      <pe-dialog-content>
        Nullam vitae odio eleifend, elementum diam in, semper tellus. Aenean porttitor nibh augue, nec malesuada dui semper quis. Nulla eu est lacus. Maecenas lacinia magna suscipit, vulputate tellus a, mollis odio. Nulla porttitor lectus ut nisi egestas, at efficitur libero bibendum. Curabitur malesuada ligula in consequat mattis. Nullam vel erat sit amet orci pharetra maximus eu a lacus. Vestibulum malesuada diam quis felis feugiat, a fermentum purus faucibus. Vivamus tristique tempor quam nec faucibus. Cras mollis diam dignissim nisi suscipit, id gravida nisi sollicitudin.
      </pe-dialog-content>
    </pe-dialog>
  `
})
export class DialogMicroOverlayExampleDocComponent implements DialogComponentInterface {

  dialogRef: DialogRef<DialogMicroOverlayExampleDocComponent>;
  loading: boolean = true;

  constructor() {
    setTimeout(() => {
      this.loading = false;
    }, 2000);
  }
}