import { Component, OnDestroy, TestabilityRegistry, ElementRef } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { ResizedEvent } from 'angular-resize-event';

@Component({
  selector: 'connect-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnDestroy {

  platformHeaderHeight$ = new BehaviorSubject(0);
  welcomeStepperHeight$ = new BehaviorSubject(0);

  constructor(
    private registry: TestabilityRegistry,
    private element: ElementRef,
  ) {
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
