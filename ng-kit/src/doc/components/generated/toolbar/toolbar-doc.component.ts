import { Component } from '@angular/core';

@Component({
  selector: 'toolbar-doc',
  templateUrl: 'toolbar-doc.component.html'
})
export class ToolbarDocComponent {
  toolbarDefaultExampleTemplate: string = require('!!raw-loader!./examples/toolbar-default-example/toolbar-default-example.component.html');
  toolbarDefaultExampleComponent: string = require('!!raw-loader!./examples/toolbar-default-example/toolbar-default-example.component.ts');
}
