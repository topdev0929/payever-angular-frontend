import { Component, OnInit, ChangeDetectorRef, ChangeDetectionStrategy } from '@angular/core';
import { BehaviorSubject, Observable, Subject, timer } from 'rxjs';
import { take } from 'rxjs/operators';
import { LocalStorage } from 'ngx-webstorage';

import { SnackBarService } from '@pe/ng-kit/modules/snack-bar';
import { EnvironmentConfigLoaderService } from '@pe/ng-kit/modules/environment-config';

import { RateSummaryInterface } from '@pe/checkout-sdk/sdk/types';
import { TimestampEvent } from '@pe/checkout-sdk/sdk/events';
import { FlowStateService } from '@pe/checkout-sdk/sdk/api';

import { FlowInterface, FlowSettingsInterface } from '@pe/checkout-sdk/sdk/types';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'checkout-cart-dev',
  templateUrl: './dev.component.html'
})
export class DevComponent implements OnInit {

  flow$: Observable<FlowInterface> = null;

  submit$: Subject<TimestampEvent> = new Subject();
  forceTotal: number = 0;
  isUseInventory: boolean = true;
  isProductsRefreshDisabled: boolean = false;

  // events
  serviceAvailable: boolean = false;

  isLoading: boolean = false;

  @LocalStorage() private flowIdValue: string;

  constructor(
    private flowStateService: FlowStateService,
    private configLoaderService: EnvironmentConfigLoaderService,
    private snackBarService: SnackBarService,
    private cdr: ChangeDetectorRef
  ) {
  }

  ngOnInit(): void {
    this.configLoaderService.loadEnvironmentConfig().subscribe(() => {
      this.fetchFlow();
    });
  }

  set flowId(flowId: string) {
    this.flowIdValue = flowId;
    this.fetchFlow();
  }

  get flowId(): string {
    return this.flowIdValue;
  }

  onServiceReadyChange(event: CustomEvent): void {
    this.serviceAvailable = !!event.detail;
  }

  onChangePaymentMethod(event: CustomEvent): void {
    alert('Change payment method trigger!');
  }

  onConfirm(): void {
    this.submit$.next(new TimestampEvent());
  }

  onSubmitted(): void {
    this.fetchFlow();
    alert('Success!');
  }

  onLoading(event: CustomEvent): void {
    this.isLoading = !!event.detail;
    this.cdr.detectChanges();
  }

  resetCartAmount(): void {
    this.flow$.pipe(take(1)).subscribe(flow => {
      const cart = flow.cart;
      cart[0].quantity = 1;
      this.flowStateService.patchFlow(this.flowId, {cart: cart}).subscribe();
    });
  }

  createFlow(): void {
    const flowData: any = {
      // payment_option_id: 29,
      billing_address: {
        city: 'Heidelberg',
        country: 'DE',
        email: 'customer2000@email.de',
        first_name: 'Alfa',
        last_name: 'Albert',
        phone: '496912341234',
        salutation: 'SALUTATION_MR',
        street: 'Vangerow12 18',
        type: 'billing',
        zip_code: '12345'
      },
      currency: 'EUR',
      channel_set_id: '4b8d0b20-24e0-4af3-8707-42037023add7',
      // channel_set_id: '6e829416-b7fe-439a-9242-a5c8ede17a2b', // // 'c09ba6ce-2a02-45ff-af53-e321e5a955f5',
      shipping_fee: 12,
      "cart":[
        // {"uuid":"0e309207-fd42-4632-b8fe-53ee7bc2d1c4","quantity":1}
        // {"_id":"2959bc5e-0e49-4d07-9f80-92057f73d33a", "quantity":5}
        {"uuid":"581b732e-0162-48c2-9e8f-c0b3acb5a05e", "name": "First cart item", "quantity":2}
      ],
      // "amount":0,

      reference: '12341234'
    };
    flowData.x_frame_host = `${window.location.protocol}//${window.location.hostname}:${window.location.port}`;
    this.flowStateService.createFlowRaw(flowData).subscribe(
      (data: any) => {
        this.flowId = data.id;
        this.fetchFlow();
        this.cdr.detectChanges();
        window.location.reload();
      },
      (error: any) => {
        console.error(error);
        this.showError(error.message);
      }
    );
  }

  protected showError(error: string): void {
    this.snackBarService.toggle(true, error || 'Unknows error', {
      duration: 5000,
      iconId: 'icon-alert-24',
      iconSize: 24
    });
  }

  private fetchFlow(): void {
    if (this.flowId) {
      this.flowStateService.getFlow(this.flowId).subscribe(() => {
        this.flow$ = this.flowStateService.getFlowStream$(this.flowId);
        this.cdr.detectChanges();
      }, error => {
        this.showError(error.message);
      });
    }
  }
}
