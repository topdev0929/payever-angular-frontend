import { Component } from '@angular/core';
import { SidebarConfig } from '../../../../../../kit/sidebar/src/sidebar.config';

@Component({
  selector: 'pe-sidebar-default-example',
  templateUrl: 'sidebar-default-example.component.html'
})
export class SidebarDefaultExampleComponent {

  isSidebarOpen: boolean;

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
