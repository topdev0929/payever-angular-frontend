import { Component, OnInit,
  ViewChild, ViewContainerRef } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { BehaviorSubject } from 'rxjs';

import { MessageBus , AppSetUpService} from '@pe/common';
import {
  PeSimpleStepperService,
  PeSimpleStepperActionType,
} from '@pe/stepper';

import { IntegrationInfoInterface, WelcomeStepEnum } from '../../../interfaces';
import { HeaderService, RootCheckoutWrapperService, StorageService } from '../../../services';

@Component({
  selector: 'welcome-payments',
  templateUrl: './payments.component.html',
  styleUrls: ['./payments.component.scss'],
})
export class WelcomePaymentsComponent implements OnInit {

  integration: IntegrationInfoInterface;
  isLoading$: BehaviorSubject<boolean> = new BehaviorSubject(false);
  isDisabled$: BehaviorSubject<boolean> = new BehaviorSubject(false);

  @ViewChild('container', { read: ViewContainerRef }) lazyContainer: ViewContainerRef;

  constructor(
    private activatedRoute: ActivatedRoute,
    private appSetUpService: AppSetUpService,
    private peStepperService: PeSimpleStepperService,
    private messageBus: MessageBus,
    private storageService: StorageService,
    private headerService: HeaderService,
    private wrapperService: RootCheckoutWrapperService,
    private router: Router
  ) {
  }

  get checkoutUuid(): string {
    return this.activatedRoute.snapshot.params['checkoutUuid']
    || this.activatedRoute.parent.snapshot.params['checkoutUuid'];
  }

  ngOnInit(): void {
    this.appSetUpService.setStep(this.storageService.businessUuid, 'checkout', WelcomeStepEnum.Payments).subscribe();
    this.peStepperService.show('stepper.payments.title', [
      {
        type: PeSimpleStepperActionType.Button,
        title: 'actions.skip',
        styling: {
          isTransparent: true,
        },
        isDisabled$: this.isLoading$,
        onClick: (event: MouseEvent) => {
          this.onSuccess();
        },
      },
      {
        type: PeSimpleStepperActionType.Button,
        title: 'actions.continue',
        isLoading$: this.isLoading$,
        isDisabled$: this.isDisabled$,
        onClick: (event: MouseEvent) => {
          this.onSuccess();
        },
      },
    ]);
    this.headerService.hideHeader();
  }

  onSuccess(): void {
    this.wrapperService.reCreateFlow(); // Refreshing to apply installed payments
    this.navigateToHome();
  }

  navigateToHome(): void {
    const base = this.storageService.getHomeUrl(this.checkoutUuid);
    this.router.navigate([`${base}/panel-checkout`]);
  }

  onLoadingsChanged(count: number): void {
    this.isLoading$.next(count > 0);
  }

  onInstalledCountChanged(count: number): void {
    this.isDisabled$.next(count === 0);
  }

  onOpenIntegration(integration: any): void {
    this.isLoading$.next(true);
    this.messageBus.emit('checkout.navigate-to-app', {
      url: `connect/payments/configure/${integration.name}`,
      getParams: {
        checkoutWelcomeScreen: true,
        checkoutUuid: this.checkoutUuid,
      },
    });
  }
}
