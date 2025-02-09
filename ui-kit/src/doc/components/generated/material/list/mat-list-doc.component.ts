import { Component } from '@angular/core';

@Component({
    selector: 'doc-mat-list',
    templateUrl: 'mat-list-doc.component.html'
})
export class MatListDocComponent {
  listDefaultExampleTemplate: string = require('!!raw-loader!./examples/default/list-default-example.component.html');
  listDefaultExampleComponent: string = require('!!raw-loader!./examples/default/list-default-example.component.ts');

  listNavigationExampleTemplate: string = require('!!raw-loader!./examples/navigation/list-navigation-example.component.html');
  listNavigationExampleComponent: string = require('!!raw-loader!./examples/navigation/list-navigation-example.component.ts');

  listNavigationAddonsExampleTemplate: string = require('!!raw-loader!./examples/navigation-addons/list-navigation-addons-example.component.html');
  listNavigationAddonsExampleComponent: string = require('!!raw-loader!./examples/navigation-addons/list-navigation-addons-example.component.ts');

  listColorVariationsExampleTemplate: string = require('!!raw-loader!./examples/color-variations/list-color-variations-example.component.html');
  listColorVariationsExampleComponent: string = require('!!raw-loader!./examples/color-variations/list-color-variations-example.component.ts');

  listContentVariationsExampleTemplate: string = require('!!raw-loader!./examples/content-variations/list-content-variations-example.component.html');
  listContentVariationsExampleComponent: string = require('!!raw-loader!./examples/content-variations/list-content-variations-example.component.ts');
}
