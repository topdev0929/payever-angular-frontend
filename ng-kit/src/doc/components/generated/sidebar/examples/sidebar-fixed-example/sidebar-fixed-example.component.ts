import { Component } from '@angular/core';
import { SidebarConfig } from '../../../../../../kit/sidebar/src/sidebar.config';

@Component({
  selector: 'pe-sidebar-fixed-example',
  templateUrl: 'sidebar-fixed-example.component.html'
})
export class SidebarFixedExampleComponent {

  isSidebarOpen: boolean;

  configuration: SidebarConfig = {
    style: 'fixed',
    position: 'right',
    showCloseBtn: true
  };

  toggleSidebar(): void {
    this.isSidebarOpen = !this.isSidebarOpen;
  }

  onSidebarOpened(): void {
    this.isSidebarOpen = true;
  }

  onSidebarClosed(): void {
    this.isSidebarOpen = false;
  }
}
