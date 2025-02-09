import { Component } from '@angular/core';
import { SidebarConfig } from '../../../../../modules/sidebar';

@Component({
  selector: 'doc-sidebar',
  templateUrl: 'sidebar-doc.component.html'
})
export class SidebarDocComponent {
  isSidebarOpen: boolean;
  htmlExample: string =  require('raw-loader!./examples/sidebar-example-basic.html.txt');
  tsExample: string =  require('raw-loader!./examples/sidebar-example-basic.ts.txt');

  sidebarDefaultExampleTemplate: string = require('!!raw-loader!./examples/sidebar-default-example/sidebar-default-example.component.html');
  sidebarDefaultExampleComponent: string = require('!!raw-loader!./examples/sidebar-default-example/sidebar-default-example.component.ts');

  sidebarModalExampleTemplate: string = require('!!raw-loader!./examples/sidebar-modal-example/sidebar-modal-example.component.html');
  sidebarModalExampleComponent: string = require('!!raw-loader!./examples/sidebar-modal-example/sidebar-modal-example.component.ts');

  sidebarTransparentExampleTemplate: string = require('!!raw-loader!./examples/sidebar-transparent-example/sidebar-transparent-example.component.html');
  sidebarTransparentExampleComponent: string = require('!!raw-loader!./examples/sidebar-transparent-example/sidebar-transparent-example.component.ts');

  sidebarFixedExampleTemplate: string = require('!!raw-loader!./examples/sidebar-fixed-example/sidebar-fixed-example.component.html');
  sidebarFixedExampleComponent: string = require('!!raw-loader!./examples/sidebar-fixed-example/sidebar-fixed-example.component.ts');


  configuration: SidebarConfig = {
    style: 'default',
    position: 'right',
    showCloseBtn: true
  };

  onSidebarOpened(): void {
    this.isSidebarOpen = true;
  }

  onSidebarClosed(): void {
    this.isSidebarOpen = false;
  }
}
