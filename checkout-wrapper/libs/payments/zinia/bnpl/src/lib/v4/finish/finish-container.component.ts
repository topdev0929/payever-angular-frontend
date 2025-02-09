import {
  Component,
  ChangeDetectionStrategy,
  Input,
  Output,
  EventEmitter,
  OnInit,
} from '@angular/core';
import { Subject, of } from 'rxjs';
import { catchError, map, switchMap } from 'rxjs/operators';

import {
  AbstractFinishContainer,
  AbstractFinishContainerComponent,
} from '@pe/checkout/finish';
import { ChangePaymentDataInterface } from '@pe/checkout/types';

import { PaymentResponse } from '../models';
import { ZiniaBnplFlowService } from '../services';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'zinia-bnpl-finish-container-v4',
  templateUrl: './finish-container.component.html',
  styles: [':host { display: block; }'],
})
export class FinishContainerComponent
  extends AbstractFinishContainerComponent
  implements OnInit, AbstractFinishContainer {

  // For payment widgets when we have many payments in flow but behave like only one
  @Input() isDisableChangePayment = false;
  @Input() showCloseButton: boolean;

  @Output() changePaymentMethod: EventEmitter<ChangePaymentDataInterface> = new EventEmitter();
  @Output() closeButtonClicked: EventEmitter<any> = new EventEmitter();
  @Output() finishModalShown: EventEmitter<boolean> = new EventEmitter<boolean>();

  private ziniaBNPLFlowService = this.injector.get(ZiniaBnplFlowService);

  private readonly verifyOtpSubject$ = new Subject<any>();
  public readonly verifyOtp$ = this.verifyOtpSubject$.pipe(
    switchMap(data => this.ziniaBNPLFlowService.optVerify(
      this.flow.id,
      this.paymentMethod,
      {
        ...data,
        paymentId: this.paymentResponse.id,
      },
    ).pipe(
      map((resp) => {
        const paymentResponse = this.nodeFlowService.getFinalResponse<PaymentResponse>();
        this.paymentResponse = {
          ...resp,
          _apiCall: paymentResponse?._apiCall,
        };
        this.cdr.markForCheck();

        return { status: 'loading' };
      }),
      catchError(err => of({
        status: 'error',
        code: err.code || err.statusCode,
      })),
    )),
  );

  otpCodeReady(code: string): void {
    this.verifyOtpSubject$.next(code);
  }
}
