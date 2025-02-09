import { Component } from '@angular/core';
import { SidebarConfig } from '../../../../../../kit/sidebar';

@Component({
  selector: 'doc-sidebar-layout-transparent',
  templateUrl: './sidebar-layout-transparent-doc.component.html'
})
export class SidebarLayoutTransparentDocComponent {

  isSidebarOpen: boolean;
  sidebarConfiguration: SidebarConfig = {
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
