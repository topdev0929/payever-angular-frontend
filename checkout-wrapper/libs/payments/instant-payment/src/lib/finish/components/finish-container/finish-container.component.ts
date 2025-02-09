import {
  Component,
  ChangeDetectionStrategy,
  Input,
  OnInit,
  ViewChild,
  ElementRef,
} from '@angular/core';
import { BehaviorSubject, EMPTY, Observable, Subject } from 'rxjs';
import { catchError, filter, switchMap, take, tap } from 'rxjs/operators';

import { AbstractFinishContainerComponent } from '@pe/checkout/finish';
import { PaymentStatusEnum } from '@pe/checkout/types';

import {
  InstantPaymentActionEnum,
  InstantPaymentService,
  NodePaymentDetailsResponseInterface,
} from '../../../shared';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'instant-payment-finish-container',
  templateUrl: './finish-container.component.html',
  styleUrls: ['./finish-container.component.scss'],
  providers: [
    InstantPaymentService,
  ],
})
export class FinishContainerComponent
  extends AbstractFinishContainerComponent<NodePaymentDetailsResponseInterface>
  implements OnInit {

  private instantPaymentService = this.injector.get(InstantPaymentService);

  @ViewChild('form') set formRef(value: ElementRef<HTMLDivElement>) {
    this.formRef$.next(value);
  }

  @Input() asSinglePayment = false;

  isShowWizardContainer: boolean;
  public wizardSessionKey$ = new Subject<string>();

  private readonly formRef$ = new BehaviorSubject<ElementRef<HTMLDivElement>>(null);

  protected showFinishModalFromExistingPayment(): void {
    this.paymentResponse = this.nodeFlowService.getFinalResponse();

    if (this.paymentResponse.payment.status === PaymentStatusEnum.STATUS_NEW) {
      this.showWizardContainer(this.paymentResponse.paymentDetails.wizardSessionKey).pipe(
        take(1),
      ).subscribe();
    } else {
      super.showFinishModalFromExistingPayment();
    }
  }

  protected paymentCallback() {
    this.paymentResponse ??= this.nodeFlowService.getFinalResponse();

    return this.paymentResponse?.paymentDetails
      ? this.showWizardContainer(this.paymentResponse.paymentDetails.wizardSessionKey)
      : EMPTY;
  }

  private showWizardContainer(wizardSessionKey: string): Observable<unknown> {
    this.isShowWizardContainer = true;
    this.cdr.detectChanges();

    return this.formRef$.pipe(
      filter(d => d instanceof ElementRef),
      tap(() => {
        this.wizardSessionKey$.next(wizardSessionKey);
      }),
      switchMap(() => this.instantPaymentService.load().pipe(
        tap(() => this.cdr.detectChanges()),
        filter(action => [InstantPaymentActionEnum.Abort, InstantPaymentActionEnum.Finish].includes(action)),
        switchMap(() => this.updateStatusAndContinue()),
      ))
    );
  }

  private updateStatusAndContinue(): Observable<unknown> {
    this.paymentResponse = null;
    this.errorMessage = null;

    return this.nodeFlowService.updatePayment<NodePaymentDetailsResponseInterface>().pipe(
      catchError((err) => {
        this.isShowWizardContainer = false;
        this.errorMessage = err.message;
        this.cdr.detectChanges();

        return EMPTY;
      }),
      tap((response) => {
        this.isShowWizardContainer = false;
        this.paymentResponse = response;
        this.cdr.detectChanges();
      }),
    );
  }
}
