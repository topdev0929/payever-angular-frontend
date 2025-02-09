import { Component } from '@angular/core';

@Component({
  selector: 'doc-sidebar-layout',
  templateUrl: './sidebar-layout-doc.component.html'
})
export class SidebarLayoutDocComponent {
  sidebarLayoutDefaultExampleTemplate: string = require('!!raw-loader!./examples/sidebar-layout-default/sidebar-layout-default-doc.component.html');
  sidebarLayoutDefaultExampleComponent: string = require('!!raw-loader!./examples/sidebar-layout-default/sidebar-layout-default-doc.component.ts');

  sidebarLayoutTransparentExampleTemplate: string = require('!!raw-loader!./examples/sidebar-layout-transparent/sidebar-layout-transparent-doc.component.html');
  sidebarLayoutTransparentExampleComponent: string = require('!!raw-loader!./examples/sidebar-layout-transparent/sidebar-layout-transparent-doc.component.ts');

  sidebarLayoutFixedExampleTemplate: string = require('!!raw-loader!./examples/sidebar-layout-fixed/sidebar-layout-fixed-doc.component.html');
  sidebarLayoutFixedExampleComponent: string = require('!!raw-loader!./examples/sidebar-layout-fixed/sidebar-layout-fixed-doc.component.ts');
}
