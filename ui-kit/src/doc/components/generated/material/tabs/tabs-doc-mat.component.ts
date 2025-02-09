import { Component } from '@angular/core';

@Component({
  selector: 'doc-tabs-mat',
  templateUrl: './tabs-doc-mat.component.html'
})
export class TabsMatDocComponent {
  tabsDefaultExampleTemplate: string = require('!!raw-loader!./examples/default/tabs-example-default.component.html');
  tabsDefaultExampleComponent: string = require('!!raw-loader!./examples/default/tabs-example-default.component.ts');
}
