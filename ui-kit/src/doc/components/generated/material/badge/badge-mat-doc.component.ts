import { Component } from '@angular/core';

@Component({
  selector: 'doc-mat-badge',
  templateUrl: 'badge-mat-doc.component.html'
})
export class BadgeMatDocComponent {
  badgeDefaultExampleTemplate: string = require('!!raw-loader!./examples/default/badge-default-example.component.html');
  badgeDefaultExampleComponent: string = require('!!raw-loader!./examples/default/badge-default-example.component.ts');

  badgeColorsExampleTemplate: string = require('!!raw-loader!./examples/colors/badge-colors-example.component.html');
  badgeColorsExampleComponent: string = require('!!raw-loader!./examples/colors/badge-colors-example.component.ts');
}
