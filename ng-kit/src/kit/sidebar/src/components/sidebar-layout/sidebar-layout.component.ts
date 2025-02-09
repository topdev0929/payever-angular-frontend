import { Component, Input, Output, EventEmitter, ViewChild, ElementRef, Renderer2 } from '@angular/core';
import { SidebarConfig } from '../../sidebar.config';

@Component({
  selector: 'pe-sidebar-layout',
  styleUrls: ['sidebar-layout.component.scss'],
  templateUrl: 'sidebar-layout.component.html'
})

export class SidebarLayoutComponent {

  @Input() mainContentFullScreen: boolean = false;
  @Input() showSidebar: boolean = true;
  @Input() sidebarConfiguration: SidebarConfig = {
    style: 'fixed',
    position: 'right',
    showCloseBtn: true
  };
  @Input() sidebarOpened: boolean = false;

  @Output() onSidebarOpened: EventEmitter<void> = new EventEmitter<void>();
  @Output() onSidebarClosed: EventEmitter<void> = new EventEmitter<void>();
  @Output() mainContentScroll: EventEmitter<void> = new EventEmitter<void>();

  @ViewChild('sidebarBeforeWrapper', { static: true }) sidebarBeforeWrapper: ElementRef;

  constructor(private renderer: Renderer2) {
  }

  toggleSidebar(): void {
    this.changeSidebarOpenedState(!this.sidebarOpened);
  }

  changeSidebarOpenedState(state: boolean): void {
    this.sidebarOpened = this.showSidebar ? state : this.sidebarOpened;
  }

  scrollMainContentTop(): void {
    this.scrollMainContent(0);
  }

  scrollMainContentBottom(): void {
    this.scrollMainContent(this.sidebarBeforeWrapper.nativeElement.scrollHeight);
  }

  scrollMainContent(top: number): void {
    this.renderer.setProperty(this.sidebarBeforeWrapper.nativeElement, 'scrollTop', top);
  }

  onMainContentScroll(): void {
    this.mainContentScroll.emit();
  }
}
