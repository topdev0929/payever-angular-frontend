import { Component } from '@angular/core';

@Component({
  selector: 'doc-tabs-sidenav',
  templateUrl: 'tabs-sidenav-doc.component.html'
})
export class TabsSidenavDocComponent {
  tabsSidenavExampleTemplate: string = require('!!raw-loader!./examples/tabs-sidenav-example/tabs-sidenav-example.component.html');
  tabsSidenavExampleComponent: string = require('!!raw-loader!./examples/tabs-sidenav-example/tabs-sidenav-example.component.ts');
  tabsSidenavExampleStyles: string = require('!!raw-loader!./examples/tabs-sidenav-example/tabs-sidenav-example.component.scss');
}
