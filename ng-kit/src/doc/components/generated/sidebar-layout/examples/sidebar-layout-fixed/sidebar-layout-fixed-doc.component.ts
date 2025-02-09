import { Component } from '@angular/core';
import { SidebarConfig } from '../../../../../../kit/sidebar';

@Component({
  selector: 'doc-sidebar-layout-fixed',
  templateUrl: './sidebar-layout-fixed-doc.component.html'
})
export class SidebarLayoutFixedDocComponent {

  isSidebarOpen: boolean;
  sidebarConfiguration: SidebarConfig = {
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
