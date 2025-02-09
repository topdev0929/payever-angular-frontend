import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

@Injectable()
export class LayoutService {
  sidebarToggleEvent: Subject<boolean> = new Subject<boolean>();
  layoutClosedEvent: Subject<boolean> = new Subject<boolean>();
  private sidebarState: boolean = false;

  toggleSidebar(): void {
    this.sidebarState = !this.sidebarState;
    this.sidebarToggleEvent.next(this.sidebarState);
  }

  closeLayout(): void {
    this.layoutClosedEvent.next(true);
  }
}
