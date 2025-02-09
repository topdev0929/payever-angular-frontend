import { Component, ElementRef, Inject, OnDestroy, OnInit, TestabilityRegistry } from '@angular/core';
import { BehaviorSubject, merge } from 'rxjs';
import { filter, takeUntil, tap } from 'rxjs/operators';
import { Router } from '@angular/router';

import { EnvService, MessageBus } from '@pe/common';

import { AbstractComponent } from '../shared/abstract.component';

import { ResizedEvent } from 'angular-resize-event';
import { SubscriptionEnvService } from 'src/modules/subscriptions/src/api/subscription/subscription-env.service';

@Component({
  selector: 'sandbox-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent extends AbstractComponent implements OnDestroy, OnInit {

  platformHeaderHeight$ = new BehaviorSubject(0);
  welcomeStepperHeight$ = new BehaviorSubject(0);

  constructor(
    public router: Router,
    private registry: TestabilityRegistry,
    private element: ElementRef,
    private messageBus: MessageBus,
    @Inject(EnvService) private envService: SubscriptionEnvService,
    @Inject('PEB_ENTITY_NAME') private entityName: string,
    @Inject('PEB_SUBSCRIPTION_HOST') private subscriptionHost: string,
  ) {
    super();
  }

  ngOnInit() {

    merge(
      this.messageBus.listen(`${this.entityName}.navigate.dashboard`).pipe(
        tap((applicationId: string) => {
          this.router.navigate([`/business/${this.envService.businessId}/subscriptions/${applicationId}/dashboard`]);
        }),
      ),
      this.messageBus.listen(`${this.entityName}.navigate.programs`).pipe(
        tap((applicationId: string) => this.router.navigate([`/business/${this.envService.businessId}/subscriptions/${applicationId}/programs`])),
      ),
      this.messageBus.listen(`${this.entityName}.navigate.themes`).pipe(
        tap((applicationId: string) => this.router.navigate([`/business/${this.envService.businessId}/subscriptions/${applicationId}/themes`])),
      ),
      this.messageBus.listen(`${this.entityName}.navigate.connect`).pipe(
        tap((applicationId: string) => this.router.navigate([`/business/${this.envService.businessId}/subscriptions/${applicationId}/connect`])),
      ),
      this.messageBus.listen(`${this.entityName}.navigate.settings`).pipe(
        tap((applicationId: string) => this.router.navigate([`/business/${this.envService.businessId}/subscriptions/${applicationId}/settings`])),
      ),
      this.messageBus.listen(`${this.entityName}.navigate.edit`).pipe(
        tap((applicationId: string) => this.router.navigate([`/business/${this.envService.businessId}/subscriptions/${applicationId}/edit`])),
      ),
      this.messageBus.listen(`${this.entityName}.open`).pipe(
        filter((applicationId: any) => !!applicationId?.name),
        tap((shop: any) => window.open(`https://${shop.name}.${this.subscriptionHost}`, '_blank')),
      ),
    ).pipe(
      takeUntil(this.destroyed$),
    ).subscribe();

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
