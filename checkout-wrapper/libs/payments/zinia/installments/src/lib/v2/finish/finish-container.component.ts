import {
  Component,
  ChangeDetectionStrategy,
  Output,
  EventEmitter,
} from '@angular/core';
import { Subject, of } from 'rxjs';
import { catchError, map, switchMap } from 'rxjs/operators';

import {
  AbstractFinishContainer,
  AbstractFinishContainerComponent,
} from '@pe/checkout/finish';

import { OpenbankFlowService, PaymentResponse } from '../shared';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'zinia-finish-container-v2',
  templateUrl: './finish-container.component.html',
  styles: [':host { display: block; }'],
})
export class FinishContainerComponent
  extends AbstractFinishContainerComponent
  implements AbstractFinishContainer {

  @Output() closeButtonClicked: EventEmitter<any> = new EventEmitter();

  @Output() finishModalShown: EventEmitter<boolean> = new EventEmitter<boolean>();

  private openbankFlowService = this.injector.get(OpenbankFlowService);
  public showChangePaymentButton = true;

  private readonly verifyOtpSubject$ = new Subject<any>();
  public readonly verifyOtp$ = this.verifyOtpSubject$.pipe(
    switchMap(data => this.openbankFlowService.optVerify(
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
