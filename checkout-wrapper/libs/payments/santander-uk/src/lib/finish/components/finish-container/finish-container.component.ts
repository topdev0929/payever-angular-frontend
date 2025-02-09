import {
  Component,
  ChangeDetectionStrategy,
  Input,
  Output,
  EventEmitter,
  OnInit,
  ViewChild,
  ElementRef,
} from '@angular/core';
import { ReplaySubject } from 'rxjs';
import { exhaustMap, take, takeUntil, tap } from 'rxjs/operators';

import { AbstractFinishContainerComponent } from '@pe/checkout/finish';
import { ExternalRedirectStorage } from '@pe/checkout/storage';
import {
  ChangePaymentDataInterface,
  PaymentStatusEnum,
} from '@pe/checkout/types';
import { PeDestroyService } from '@pe/destroy';

import {
  NodePaymentRedirectInterface,
  NodePaymentDetailsResponseInterface,
} from '../../../shared';


@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'santander-uk-finish-container',
  templateUrl: './finish-container.component.html',
  styleUrls: ['./finish-container.component.scss'],
  providers: [PeDestroyService],
})
export class FinishContainerComponent
  extends AbstractFinishContainerComponent
  implements OnInit {

  @ViewChild('redirectForm', { static: false }) redirectFormRef: ElementRef<HTMLFormElement>;

  // For payment widgets when we have many payments in flow but behava like only one
  @Input() isDisableChangePayment = false;

  @Input() showCloseButton: boolean;

  @Output() changePaymentMethod: EventEmitter<ChangePaymentDataInterface> = new EventEmitter();
  @Output() closeButtonClicked: EventEmitter<any> = new EventEmitter();
  @Output() finishModalShown: EventEmitter<boolean> = new EventEmitter<boolean>();

  postRedirectData: NodePaymentRedirectInterface;

  protected externalRedirectStorage = this.injector.get(ExternalRedirectStorage);

  private readonly paymentProcessStorageKey = `${this.paymentMethod}__payment-processed`;
  private pollPaymentSubject$ = new ReplaySubject<void>(1);
  redirecting = false;

  tryAgain(): void {
    this.showFinishModalFromExistingPayment();
  }

  ngOnInit(): void {
    super.ngOnInit();

    const isPaymentProcessed: boolean = this.flowStorage.getData(
      this.flow.id,
      this.paymentProcessStorageKey,
      null,
    );

    if (isPaymentProcessed) {
      this.showFinishModalFromExistingPayment();
    } else {
      this.redirecting = true;
      const {
        paymentDetails: { postParam, postUrl, postValue },
      } = this.nodeFlowService.getFinalResponse<NodePaymentRedirectInterface>();
      this.postRedirectData = { postParam, postUrl, postValue };
      this.flowStorage.setData(
        this.flow.id,
        this.paymentProcessStorageKey,
        true,
      );
      this.externalRedirectStorage.saveDataBeforeRedirect(this.flow).pipe(
        tap(() => {
          this.cdr.detectChanges();
          this.redirectFormRef.nativeElement.submit();
        },
        takeUntil(this.destroy$),
      )).subscribe();
    }
    this.onServiceReady.next(true);

    this.pollPaymentSubject$.pipe(
      take(1),
      exhaustMap(() => this.nodeFlowService.pollPaymentUntilStatus<NodePaymentDetailsResponseInterface>(
        PaymentStatusEnum.STATUS_ACCEPTED,
        PaymentStatusEnum.STATUS_NEW,
      ).pipe(
        tap(() => {
          this.paymentResponse =
            this.nodeFlowService.getFinalResponse<NodePaymentDetailsResponseInterface>();
          this.cdr.markForCheck();
        }, (err) => {
          this.errorMessage = err.message || 'Unknown error';
          this.cdr.markForCheck();
        }),
      )),
      takeUntil(this.destroy$),
    ).subscribe();
  }

  showFinishModalFromExistingPayment(): void {
    this.pollPaymentSubject$.next();
  }
}
