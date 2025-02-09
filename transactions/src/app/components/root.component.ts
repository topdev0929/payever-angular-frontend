import { Component, TestabilityRegistry, OnDestroy, ElementRef } from '@angular/core';
import { Observable } from 'rxjs';

import { PlatformHeaderService } from '@pe/ng-kit/modules/platform-header';

import { environment } from '../../environments/environment';

@Component({
  selector: 'transactions-app',
  templateUrl: 'root.component.html',
  styleUrls: ['root.component.scss']
})
export class RootComponent implements OnDestroy {

  belowPlatformSubheader$: Observable<boolean> = this.platformHeaderService.mobileView$;

  get isDevMode(): boolean {
    return !environment.production || window.location.hostname === 'transactions-frontend.staging.devpayever.com';
  }

  constructor(
    private platformHeaderService: PlatformHeaderService,
    private registry: TestabilityRegistry,
    private element: ElementRef,
  ) {
  }

  ngOnDestroy(): void {
    this.registry.unregisterApplication(this.element.nativeElement);
  }
}
