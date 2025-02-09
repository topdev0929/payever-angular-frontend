import { Component } from '@angular/core';
import { SidebarConfig } from '../../../../../../kit/sidebar/src/sidebar.config';

@Component({
  selector: 'pe-sidebar-transparent-example',
  templateUrl: 'sidebar-transparent-example.component.html'
})
export class SidebarTransparentExampleComponent {

  isSidebarOpen: boolean;

  configuration: SidebarConfig = {
    style: 'transparent',
    position: 'right',
    showCloseBtn: true,
    backgroundImage: 'assets/img/background.jpg'
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
