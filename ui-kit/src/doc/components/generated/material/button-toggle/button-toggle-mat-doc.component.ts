import { Component } from '@angular/core';

@Component({
  selector: 'doc-button-toggle-mat',
  templateUrl: './button-toggle-mat-doc.component.html'
})
export class ButtonToggleMatDocComponent {
  buttonToggleDefaultExampleTemplate: string = require('!!raw-loader!./examples/default/button-toggle-example-default.component.html');
  buttonToggleDefaultExampleComponent: string = require('!!raw-loader!./examples/default/button-toggle-example-default.component.ts');

  buttonToggleIconExampleTemplate: string = require('!!raw-loader!./examples/icon/button-toggle-example-icon.component.html');
  buttonToggleIconExampleComponent: string = require('!!raw-loader!./examples/icon/button-toggle-example-icon.component.ts');

  buttonToggleVolumetricExampleTemplate: string = require('!!raw-loader!./examples/volumetric/button-toggle-example-volumetric.component.html');
  buttonToggleVolumetricExampleComponent: string = require('!!raw-loader!./examples/volumetric/button-toggle-example-volumetric.component.ts');
}
