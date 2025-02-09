import { Component } from '@angular/core';

@Component({
  selector: 'doc-tree',
  templateUrl: 'tree-doc.component.html'
})
export class TreeDocComponent {
  treeDefaultExampleTemplate: string = require('!!raw-loader!./examples/tree-default-example/tree-default-example.component.html');
  treeDefaultExampleComponent: string = require('!!raw-loader!./examples/tree-default-example/tree-default-example.component.ts');
  treeDefaultExampleStyles: string = require('!!raw-loader!./examples/tree-default-example/tree-default-example.component.scss');
}
