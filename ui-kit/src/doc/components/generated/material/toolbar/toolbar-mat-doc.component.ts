import { Component } from '@angular/core';

@Component({
  selector: 'doc-mat-toolbar',
  templateUrl: './toolbar-mat-doc.component.html'
})
export class ToolbarMatDocComponent {
  toolbarNoStylesExampleTemplate: string = require('!!raw-loader!./examples/no-styles/toolbar-example-no-styles.component.html');
  toolbarNoStylesExampleComponent: string = require('!!raw-loader!./examples/no-styles/toolbar-example-no-styles.component.ts');

  toolbarStyleVariationsExampleTemplate: string = require('!!raw-loader!./examples/style-variations/toolbar-example-style-variations.component.html');
  toolbarStyleVariationsExampleComponent: string = require('!!raw-loader!./examples/style-variations/toolbar-example-style-variations.component.ts');

  toolbarBlurExampleTemplate: string = require('!!raw-loader!./examples/blur/toolbar-example-blur.component.html');
  toolbarBlurExampleComponent: string = require('!!raw-loader!./examples/blur/toolbar-example-blur.component.ts');

  toolbarSizeVariationsExampleTemplate: string = require('!!raw-loader!./examples/size-variations/toolbar-example-size-variations.component.html');
  toolbarSizeVariationsExampleComponent: string = require('!!raw-loader!./examples/size-variations/toolbar-example-size-variations.component.ts');

  toolbarExtraElementsExampleTemplate: string = require('!!raw-loader!./examples/extra-elements/toolbar-example-extra-elements.component.html');
  toolbarExtraElementsExampleComponent: string = require('!!raw-loader!./examples/extra-elements/toolbar-example-extra-elements.component.ts');

  toolbarAppsVariationsExampleTemplate: string = require('!!raw-loader!./examples/apps-variations/toolbar-example-apps-variations.component.html');
  toolbarAppsVariationsExampleComponent: string = require('!!raw-loader!./examples/apps-variations/toolbar-example-apps-variations.component.ts');
}
