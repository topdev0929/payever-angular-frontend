import { Component } from '@angular/core';

@Component({
  selector: 'doc-expansion-panel',
  templateUrl: './expansion-panel-mat-doc.component.html'
})
export class ExpansionPanelMatDocComponent {
  expansionPanelDefaultExampleTemplate: string = require('!!raw-loader!./examples/default/expansion-panel-example-default.component.html');
  expansionPanelDefaultExampleComponent: string = require('!!raw-loader!./examples/default/expansion-panel-example-default.component.ts');

  expansionPanelDarkExampleTemplate: string = require('!!raw-loader!./examples/dark/expansion-panel-example-dark.component.html');
  expansionPanelDarkExampleComponent: string = require('!!raw-loader!./examples/dark/expansion-panel-example-dark.component.ts');

  expansionPanelExtendedExampleTemplate: string = require('!!raw-loader!./examples/extended/expansion-panel-example-extended.component.html');
  expansionPanelExtendedExampleComponent: string = require('!!raw-loader!./examples/extended/expansion-panel-example-extended.component.ts');

}
