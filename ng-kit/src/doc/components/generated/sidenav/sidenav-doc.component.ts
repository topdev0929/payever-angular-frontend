import { Component } from '@angular/core';

@Component({
  selector: 'doc-sidenav',
  templateUrl: 'sidenav-doc.component.html'
})
export class SidenavDocComponent {
  sidenavDefaultExampleTemplate: string = require('!!raw-loader!./examples/sidenav-default-example/sidenav-default-example.component.html');
  sidenavDefaultExampleComponent: string = require('!!raw-loader!./examples/sidenav-default-example/sidenav-default-example.component.ts');
  sidenavDefaultExampleStyles: string = require('!!raw-loader!./examples/sidenav-default-example/sidenav-default-example.component.scss');

  sidenavTabsExampleTemplate: string = require('!!raw-loader!./examples/sidenav-tabs-example/sidenav-tabs-example.component.html');
  sidenavTabsExampleComponent: string = require('!!raw-loader!./examples/sidenav-tabs-example/sidenav-tabs-example.component.ts');
  sidenavTabsExampleStyles: string = require('!!raw-loader!./examples/sidenav-tabs-example/sidenav-tabs-example.component.scss');

  drawerDefaultExampleTemplate: string = require('!!raw-loader!./examples/drawer-default-example/drawer-default-example.component.html');
  drawerDefaultExampleComponent: string = require('!!raw-loader!./examples/drawer-default-example/drawer-default-example.component.ts');
  drawerDefaultExampleStyles: string = require('!!raw-loader!./examples/drawer-default-example/drawer-default-example.component.scss');
}
