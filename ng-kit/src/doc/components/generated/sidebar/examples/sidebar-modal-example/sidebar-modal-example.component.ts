import { Component } from '@angular/core';
import { SidebarConfig } from '../../../../../../kit/sidebar/src/sidebar.config';

@Component({
  selector: 'pe-sidebar-modal-example',
  templateUrl: 'sidebar-modal-example.component.html'
})
export class SidebarModalExampleComponent {

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
