import { Component } from '@angular/core';

@Component({
  selector: 'dialog-mat-doc',
  templateUrl: 'dialog-mat-doc.component.html'
})
export class DialogMatDocComponent {
  dialogDefaultExampleTemplate: string = require('!!raw-loader!./examples/default/dialog-default-example.component.html');
  dialogDefaultExampleComponent: string = require('!!raw-loader!./examples/default/dialog-default-example.component.ts');

  dialogMicroOverlayExampleTemplate: string = require('!!raw-loader!./examples/micro-overlay/dialog-micro-overlay-example.component.html');
  dialogMicroOverlayExampleComponent: string = require('!!raw-loader!./examples/micro-overlay/dialog-micro-overlay-example.component.ts');
}
