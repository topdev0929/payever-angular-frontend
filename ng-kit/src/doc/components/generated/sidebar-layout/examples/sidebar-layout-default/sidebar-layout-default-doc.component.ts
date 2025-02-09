import { Component } from '@angular/core';
import { SidebarConfig } from '../../../../../../kit/sidebar';

@Component({
  selector: 'doc-sidebar-layout-default',
  templateUrl: './sidebar-layout-default-doc.component.html'
})
export class SidebarLayoutDefaultDocComponent {

  isSidebarOpen: boolean;
  sidebarConfiguration: SidebarConfig = {
    style: 'default',
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
