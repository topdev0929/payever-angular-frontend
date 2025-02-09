import { ChangeDetectionStrategy, ChangeDetectorRef, Component, Injector, Input, OnInit } from '@angular/core';
import { BehaviorSubject, interval, Subscription, throwError } from 'rxjs';
import { catchError, switchMap, takeUntil, takeWhile, tap } from 'rxjs/operators';

import { ApiService } from '@pe/checkout/api';
import { TopLocationService } from '@pe/checkout/location';
import { NodeFlowService } from '@pe/checkout/node-api';
import { ExternalRedirectStorage } from '@pe/checkout/storage';
import {
  FlowInterface,
  NodePaymentResponseInterface,
  PaymentInterface,
  PaymentMethodEnum,
  PaymentSpecificStatusEnum,
  PaymentStatusEnum,
} from '@pe/checkout/types';
import { CustomElementService } from '@pe/checkout/utils';
import { PeDestroyService } from '@pe/destroy';

import { NodePaymentResponseDetailsInterface } from '../merchant-adoption/merchant-adoption.component';

@Component({
  selector: 'santander-de-pos-self-adoption',
  templateUrl: './self-adoption.component.html',
  styleUrls: ['./self-adoption.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [PeDestroyService],
})

export class SelfAdoptionComponent implements OnInit {
  @Input() flow: FlowInterface = null;
  @Input() payment: PaymentInterface = null;

  @Input() set nodeResult(payment: NodePaymentResponseInterface<any>) {
    this._nodeResult = payment;
    this.updateTranslates();
    this.checkStatus();
  }

  get nodeResult(): NodePaymentResponseInterface<any> {
    return this._nodeResult;
  }

  @Input() paymentMethod: PaymentMethodEnum;

  _nodeResult: NodePaymentResponseInterface<any> = null;
  selfNote11 = $localize`:@@payment-santander-de-pos.inquiry.finish.adoption.self.note11:
    ${this.nodeResult?.paymentDetails?.applicationNo}:applicationNo:`;

  updatingProcess$ = new BehaviorSubject<boolean>(false);
  step = 1;
  isSubmitted = false;
  isInDecision = false;
  isTimeoutInApproved = false;
  errorMessage: string = null;

  protected nodeFlowService: NodeFlowService = this.injector.get(NodeFlowService);

  constructor(
    protected customElementService: CustomElementService,
    protected destroy$: PeDestroyService,
    private injector: Injector,
    private windowTopLocation: TopLocationService,
    private cdr: ChangeDetectorRef,
    private apiService: ApiService,
    private externalRedirectStorage: ExternalRedirectStorage,
  ) {
    (window as any).PayeverStatic?.SvgIconsLoader?.loadIcons([
      'progress-94',
      'web-id',
    ], null, this.customElementService.shadowRoot);
  }

  get variables(): { [key: string]: string } {
    return {
      applicationNo: this.nodeResult?.paymentDetails?.applicationNo,
    };
  }

  ngOnInit(): void {
    this.checkStatus();
  }

  onSignNow(event: Event): void {
    event.stopPropagation();
    // Why we have to save whole flow at server? Because of Safari.
    // When it's inside iframe it has isolated local storage.
    // So when we redirect back to page, we loose all information.
    // As result we have to temporary keep it on server.
    // Also it's needed when we start payment at one domain
    // (and wrapper is not iframe but web component) and continue at checkout payever domain (after redirect back)
    this.updatingProcess$.next(true);
    this.apiService._getFlow(this.flow.id).pipe(
      switchMap(flow => this.externalRedirectStorage.saveDataBeforeRedirect(flow).pipe(
        tap(() => {
          this.windowTopLocation.href = this.nodeResult.paymentDetails.customerSigningLink;
        }),
        catchError((err) => {
          this.updatingProcess$.next(false);

          return throwError(err);
        }),
      )),
    ).subscribe();
  }

  runUpdatePayment(): void {
    this.updatingProcess$.next(true);
    const start: number = Math.floor(Date.now());
    const delay: number = 6 * 1000;
    const timeout: number = 5 * 60 * 1000;
    let isUpdating = false; // This one we use to avoid many /update-status requests running in parallel
    const sub: Subscription = interval(delay).pipe(
      takeWhile(() => Math.floor(Date.now()) < (start + timeout) || this.step > 1),
      takeUntil(this.destroy$),
    ).subscribe({
        next: () => {
          if (!isUpdating) {
            isUpdating = true;
            this.errorMessage = null;
            this.nodeFlowService.updatePayment<NodePaymentResponseDetailsInterface>().pipe(
              takeUntil(this.destroy$),
            ).subscribe((nodePaymentResponse: NodePaymentResponseInterface<NodePaymentResponseDetailsInterface>) => {
              this.nodeResult = nodePaymentResponse;
              if (
                this.nodeResult.payment.specificStatus === PaymentSpecificStatusEnum.STATUS_VERIFIED
                || this.nodeResult.paymentDetails?.isVerified
              ) {
                this.checkStatus();
                sub.unsubscribe();
                this.updatingProcess$.next(false);
              }
              this.cdr.detectChanges();
              isUpdating = false;
            }, (err) => {
              isUpdating = false;
              this.errorMessage = err.message || 'Unknown error!';
            });
          }
        },
        complete: () => {
          this.isTimeoutInApproved = true;
          this.checkStatus();
          this.updatingProcess$.next(false);
          this.cdr.detectChanges();
        },
      },
    );
  }

  private checkStatus(): void {
    const pss = this.nodeResult.payment.specificStatus;
    const isVerified = this.nodeResult.paymentDetails?.isVerified;
    this.isInDecision = [
      PaymentSpecificStatusEnum.STATUS_IN_ENTSCHEIDUNG, PaymentSpecificStatusEnum.STATUS_ZURUECKGESTELLT,
    ].indexOf(pss) >= 0;
    // This one means just STATUS_VERIFIED and condition should not happen but we handle just for sure
    const isCustomStatusVerified = pss === PaymentSpecificStatusEnum.STATUS_GENEHMIGT && isVerified;

    if (
      [
        PaymentSpecificStatusEnum.STATUS_GENEHMIGT,
        PaymentSpecificStatusEnum.STATUS_IN_ENTSCHEIDUNG,
        PaymentSpecificStatusEnum.STATUS_ZURUECKGESTELLT,
      ].indexOf(pss) >= 0
      && !isVerified
      && !this.isTimeoutInApproved
    ) {
      this.step = 1;
    } else if (
      pss === PaymentSpecificStatusEnum.STATUS_VERIFIED
      || isCustomStatusVerified || (this.isInDecision && isVerified
      ) || this.isTimeoutInApproved) {
      this.step = 2;
    } else if (
      pss === PaymentSpecificStatusEnum.STATUS_SIGNED
      || this.nodeResult.payment.status === PaymentStatusEnum.STATUS_ACCEPTED
    ) {
      this.step = 3;
    }

    this.cdr.detectChanges();
  }

  private updateTranslates() {
    this.selfNote11 = $localize`:@@payment-santander-de-pos.inquiry.finish.adoption.self.note11:${this.nodeResult?.paymentDetails?.applicationNo}:applicationNo:`;
  }
}
