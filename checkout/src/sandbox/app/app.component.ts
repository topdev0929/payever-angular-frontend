import { Component, OnDestroy, TestabilityRegistry, ElementRef, OnInit } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { ResizedEvent } from 'angular-resize-event';
import { PePlatformHeaderService } from '@pe/platform-header';
import { PeDataGridSidebarService } from '@pe/data-grid';

@Component({
  selector: 'checkout-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit, OnDestroy {

  platformHeaderHeight$ = new BehaviorSubject(0);
  welcomeStepperHeight$ = new BehaviorSubject(0);

  constructor(
    private registry: TestabilityRegistry,
    private element: ElementRef,
    public headerService: PePlatformHeaderService,
    public dataGridSidebarService: PeDataGridSidebarService
  ) {
  }

  ngOnInit() {
    this.headerService.setConfig({
      mainDashboardUrl: '',
      currentMicroBaseUrl: '',
      isShowShortHeader: false,
      mainItem: null,
      isShowMainItem: false,
      showDataGridToggleItem: {
        onClick: () => {}
      },
      isShowDataGridToggleComponent: true,
      closeItem: {
        title: 'Back to apps',
        icon: '#icon-apps-header',
        iconType: 'vector',
        iconSize: '22px',
        isActive: true,
        class: 'checkout-header-close'
      },
      isShowCloseItem: true,
      leftSectionItems: [],
      rightSectionItems: [],
      businessItem: {},
      isShowBusinessItem: false,
      isShowBusinessItemText: false,
    });
  }

  ngOnDestroy(): void {
    this.registry.unregisterApplication(this.element.nativeElement);
  }

  onPlatformHeaderResized(event: ResizedEvent) {
    this.platformHeaderHeight$.next(event.newHeight);
  }

  onWelcomeStepperResized(event: ResizedEvent) {
    this.welcomeStepperHeight$.next(event.newHeight);
  }
}
