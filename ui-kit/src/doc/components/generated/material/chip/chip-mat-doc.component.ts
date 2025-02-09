import { Component } from '@angular/core';

@Component({
  selector: 'doc-mat-chip',
  templateUrl: './chip-mat-doc.component.html'
})
export class ChipMatDocComponent {
  chipDefaultExampleTemplate: string = require('!!raw-loader!./examples/default/chip-example-default.component.html');
  chipDefaultExampleComponent: string = require('!!raw-loader!./examples/default/chip-example-default.component.ts');
}
