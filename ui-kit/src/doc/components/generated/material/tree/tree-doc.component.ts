import { Component } from '@angular/core';

@Component({
    selector: 'doc-tree',
    templateUrl: './tree-doc.component.html'
})
export class TreeDocComponent {
  treeDefaultExampleTemplate: string = require('!!raw-loader!./examples/default/tree-example-default.component.html');
  treeDefaultExampleComponent: string = require('!!raw-loader!./examples/default/tree-example-default.component.ts');

  treeStyleExampleTemplate: string = require('!!raw-loader!./examples/style/tree-example-style.component.html');
  treeStyleExampleComponent: string = require('!!raw-loader!./examples/style/tree-example-style.component.ts');
}
