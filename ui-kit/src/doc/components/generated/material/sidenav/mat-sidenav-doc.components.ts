import { Component } from '@angular/core';

@Component({
  selector: 'doc-mat-sidenav',
  templateUrl: './mat-sidenav-doc.components.html'
})
export class MatSidenavDocComponents {
  sidenavTreeExampleTemplate: string = require('!!raw-loader!./examples/with-tree/sidenav-tree-example.component.html');
  sidenavTreeExampleComponent: string = require('!!raw-loader!./examples/with-tree/sidenav-tree-example.component.ts');

  sidenavFieldsetExampleTemplate: string = require('!!raw-loader!./examples/with-fieldset/sidenav-fieldset-example.component.html');
  sidenavFieldsetExampleComponent: string = require('!!raw-loader!./examples/with-fieldset/sidenav-fieldset-example.component.ts');

  sidenavGridListExampleTemplate: string = require('!!raw-loader!./examples/with-grid-list/sidenav-grid-list-example.component.html');
  sidenavGridListExampleComponent: string = require('!!raw-loader!./examples/with-grid-list/sidenav-grid-list-example.component.ts');

  sidenavTabsExampleTemplate: string = require('!!raw-loader!./examples/with-tabs/sidenav-tabs-example.component.html');
  sidenavTabsExampleComponent: string = require('!!raw-loader!./examples/with-tabs/sidenav-tabs-example.component.ts');

  sidenavPaddingsExampleTemplate: string = require('!!raw-loader!./examples/with-paddings-modifier/sidenav-paddings-example.component.html');
  sidenavPaddingsExampleComponent: string = require('!!raw-loader!./examples/with-paddings-modifier/sidenav-paddings-example.component.ts');

  sidenavFitContentExampleTemplate: string = require('!!raw-loader!./examples/with-fit-content-modifier/sidenav-fit-content-example.component.html');
  sidenavFitContentExampleComponent: string = require('!!raw-loader!./examples/with-fit-content-modifier/sidenav-fit-content-example.component.ts');
}
