import { AsyncPipe } from '@angular/common';
import { Component, Inject, NgZone } from '@angular/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { RouterOutlet } from '@angular/router';
import { ApmService } from '@elastic/apm-rum-angular';
import { BehaviorSubject } from 'rxjs';
import { first, map, startWith, switchMap } from 'rxjs/operators';

import { LoaderService } from '@pe/checkout/core/loader';
import { EnvironmentConfigInterface, PE_ENV } from '@pe/common';
import { PeDestroyService } from '@pe/destroy';

import { slideInOutAnimation } from './animations';

@Component({
  selector: 'checkout-root',
  templateUrl: 'root.component.html',
  animations: [slideInOutAnimation],
  standalone: true,
  imports: [
    RouterOutlet,
    AsyncPipe,
  ],
  providers: [
    PeDestroyService,
  ],
})
export class RootComponent {

  protected readonly skeleton$ = new BehaviorSubject<SafeHtml>(null);

  public animationState$ = this.loaderService.loaderGlobal$.pipe(
    startWith(true),
    switchMap(isLoading => this.ngZone.onStable.pipe(
      first(),
      map(() => isLoading ? 'in' : 'out')
    )),
  );

  constructor(
    private readonly sanitizer: DomSanitizer,
    private readonly loaderService: LoaderService,
    private readonly apmService: ApmService,
    private ngZone: NgZone,
    @Inject(PE_ENV) private env: EnvironmentConfigInterface,
  ) {

    this.apmService.init({
      logLevel: 'error',
      serviceName: 'checkout-app',
      serverUrl: this.env.custom?.elasticUrl,
      disableInstrumentations: ['error', 'xmlhttprequest', 'fetch'],
      serviceVersion: 'MICRO_CHECKOUT_VERSION',
    });

    this.apmService.observe();

    // Skeleton is already loaded in index.html. We just place it on page again
    const indexPageSkeleton = window.document.getElementById('pe-index-page-skeleton-content');
    if (indexPageSkeleton) {
      this.skeleton$.next(this.sanitizer.bypassSecurityTrustHtml(indexPageSkeleton.innerHTML));
    } else {
      // This one comes from index.html
      (window as any).pe_onIndexPageSkeletonLoaded = () => {
        const indexPageSkeletonElem = window.document.getElementById('pe-index-page-skeleton-content');
        if (indexPageSkeletonElem) {
          this.skeleton$.next(this.sanitizer.bypassSecurityTrustHtml(indexPageSkeletonElem.innerHTML));
        }
      };

    }
  }
}
