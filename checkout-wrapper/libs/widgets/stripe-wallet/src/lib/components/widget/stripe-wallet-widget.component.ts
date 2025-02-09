import {
  AsyncPipe,
  NgComponentOutlet,
  NgIf,
} from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  Injector,
  Input,
  OnChanges,
  Output,
  Type,
} from '@angular/core';
import { ReplaySubject, defer } from 'rxjs';
import { map, switchMap } from 'rxjs/operators';

import {
  CustomWidgetConfigInterface,
  PaymentItem,
  PaymentMethodEnum,
} from '@pe/checkout/types';
import { PeDestroyService } from '@pe/destroy';

import { COMPONENT_CONFIG } from '../../constants';

import { ApplePayComponent } from './apple-pay';
import { GooglePayComponent } from './google-pay';

const COMPONENT_MAP: { [key in PaymentMethodEnum]?: () => Promise<Type<unknown>>; } = {
  apple_pay: () => import('./apple-pay').then(m => m.ApplePayComponent),
  google_pay: () => import('./google-pay').then(m => m.GooglePayComponent),
};

@Component({
  selector: 'stripe-wallet-widget',
  templateUrl: './stripe-wallet-widget.component.html',
  styleUrls: ['./stripe-wallet-widget.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
  imports: [
    AsyncPipe,
    NgIf,
    NgComponentOutlet,
    ApplePayComponent,
    GooglePayComponent,
  ],
  providers: [
    PeDestroyService,
  ],
})
export class StripeWalletWidgetComponent implements OnChanges {
  @Input() amount: number;

  @Input() channelSet: string;

  @Input() config: CustomWidgetConfigInterface;

  @Input() cart: PaymentItem[];

  @Input() isDebugMode: boolean;

  @Input() paymentMethod = PaymentMethodEnum.APPLE_PAY;

  @Input() theme: string;

  // eslint-disable-next-line
  @Output('clicked') clickedEmitter = new EventEmitter();

  // eslint-disable-next-line
  @Output('failed') failedEmitter = new EventEmitter();

  protected readonly paymentMethods = PaymentMethodEnum;

  private inputsChanged$ = new ReplaySubject<void>();

  protected readonly config$ = defer(() => COMPONENT_MAP[this.paymentMethod]()).pipe(
    switchMap(component => this.inputsChanged$.pipe(
      map(() => ({
        component,
        injector: Injector.create({
          providers: [
            {
              provide: COMPONENT_CONFIG,
              useValue: {
                amount: this.amount,
                channelSet: this.channelSet,
                config: this.config,
                cart: this.cart,
                isDebugMode: this.isDebugMode,
                theme: this.theme,
              },
            },
          ],
        }),
      }))
    )),
  );

  ngOnChanges(): void {
    this.inputsChanged$.next();
  }
}
