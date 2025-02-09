import { Component } from '@angular/core';

@Component({
  selector: 'doc-button-mat',
  templateUrl: './button-mat-doc.component.html'
})
export class ButtonMatDocComponent {
  buttonDefaultExampleTemplate: string = require('!!raw-loader!./examples/default/button-example-default.component.html');
  buttonDefaultExampleComponent: string = require('!!raw-loader!./examples/default/button-example-default.component.ts');

  buttonRaisedExampleTemplate: string = require('!!raw-loader!./examples/raised/button-example-raised.component.html');
  buttonRaisedExampleComponent: string = require('!!raw-loader!./examples/raised/button-example-raised.component.ts');

  buttonGradientExampleTemplate: string = require('!!raw-loader!./examples/gradient/button-example-gradient.component.html');
  buttonGradientExampleComponent: string = require('!!raw-loader!./examples/gradient/button-example-gradient.component.ts');

  buttonLinkExampleTemplate: string = require('!!raw-loader!./examples/link/button-example-link.component.html');
  buttonLinkExampleComponent: string = require('!!raw-loader!./examples/link/button-example-link.component.ts');

  buttonSizesExampleTemplate: string = require('!!raw-loader!./examples/sizes/button-example-sizes.component.html');
  buttonSizesExampleComponent: string = require('!!raw-loader!./examples/sizes/button-example-sizes.component.ts');

  buttonSpinnerExampleTemplate: string = require('!!raw-loader!./examples/spinner/button-example-spinner.component.html');
  buttonSpinnerExampleComponent: string = require('!!raw-loader!./examples/spinner/button-example-spinner.component.ts');

  buttonBlockExampleTemplate: string = require('!!raw-loader!./examples/block/button-example-block.component.html');
  buttonBlockExampleComponent: string = require('!!raw-loader!./examples/block/button-example-block.component.ts');

  buttonDisabledExampleTemplate: string = require('!!raw-loader!./examples/disabled/button-example-disabled.component.html');
  buttonDisabledExampleComponent: string = require('!!raw-loader!./examples/disabled/button-example-disabled.component.ts');

  buttonIconExampleTemplate: string = require('!!raw-loader!./examples/icon/button-example-icon.component.html');
  buttonIconExampleComponent: string = require('!!raw-loader!./examples/icon/button-example-icon.component.ts');

  buttonRoundedExampleTemplate: string = require('!!raw-loader!./examples/rounded/button-example-rounded.component.html');
  buttonRoundedExampleComponent: string = require('!!raw-loader!./examples/rounded/button-example-rounded.component.ts');

  buttonSetExampleTemplate: string = require('!!raw-loader!./examples/buttonset/button-example-set.component.html');
  buttonSetExampleComponent: string = require('!!raw-loader!./examples/buttonset/button-example-set.component.ts');

  buttonMenuExampleTemplate: string = require('!!raw-loader!./examples/menu/button-example-menu.component.html');
  buttonMenuExampleComponent: string = require('!!raw-loader!./examples/menu/button-example-menu.component.ts');

  buttonRectExampleTemplate: string = require('!!raw-loader!./examples/rect/button-example-rect.component.html');
  buttonRectExampleComponent: string = require('!!raw-loader!./examples/rect/button-example-rect.component.ts');
}
