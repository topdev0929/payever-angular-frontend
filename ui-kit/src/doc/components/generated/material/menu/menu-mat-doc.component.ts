import { Component } from '@angular/core';

@Component({
  selector: 'doc-menu-mat',
  templateUrl: './menu-mat-doc.component.html'
})
export class MenuMatDocComponent {
  menuDefaultExampleTemplate: string = require('!!raw-loader!./examples/default/menu-example-default.component.html');
  menuDefaultExampleComponent: string = require('!!raw-loader!./examples/default/menu-example-default.component.ts');

  menuIconsExampleTemplate: string = require('!!raw-loader!./examples/icons/menu-example-icons.component.html');
  menuIconsExampleComponent: string = require('!!raw-loader!./examples/icons/menu-example-icons.component.ts');

  menuSizeVariationsExampleTemplate: string = require('!!raw-loader!./examples/size-variations/menu-example-size-variations.component.html');
  menuSizeVariationsExampleComponent: string = require('!!raw-loader!./examples/size-variations/menu-example-size-variations.component.ts');

  menuPaddingVariationsExampleTemplate: string = require('!!raw-loader!./examples/padding-variations/menu-example-padding-variations.component.html');
  menuPaddingVariationsExampleComponent: string = require('!!raw-loader!./examples/padding-variations/menu-example-padding-variations.component.ts');

  menuColorVariationsExampleTemplate: string = require('!!raw-loader!./examples/color-variations/menu-example-color-variations.component.html');
  menuColorVariationsExampleComponent: string = require('!!raw-loader!./examples/color-variations/menu-example-color-variations.component.ts');

  menuWithSwitcherExampleTemplate: string = require('!!raw-loader!./examples/with-switcher/menu-example-with-switcher.component.html');
  menuWithSwitcherExampleComponent: string = require('!!raw-loader!./examples/with-switcher/menu-example-with-switcher.component.ts');

  menuWithNumberFieldExampleTemplate: string = require('!!raw-loader!./examples/with-number-field/menu-example-with-number-field.component.html');
  menuWithNumberFieldExampleComponent: string = require('!!raw-loader!./examples/with-number-field/menu-example-with-number-field.component.ts');

  menuWithIndicatorExampleTemplate: string = require('!!raw-loader!./examples/with-indicator/menu-example-with-indicator.component.html');
  menuWithIndicatorExampleComponent: string = require('!!raw-loader!./examples/with-indicator/menu-example-with-indicator.component.ts');
}
