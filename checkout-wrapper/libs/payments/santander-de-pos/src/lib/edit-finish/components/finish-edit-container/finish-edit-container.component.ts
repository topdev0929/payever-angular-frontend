import { ChangeDetectionStrategy, Component, EventEmitter, Input, NgZone, OnInit, Output } from '@angular/core';
import { Actions } from '@ngxs/store';
import { Observable, of } from 'rxjs';
import { catchError, first, switchMap, tap } from 'rxjs/operators';

import { EditTransactionStorageService } from '@pe/checkout/api/edit-transaction';
import {
  NodePaymentDetailsResponseInterface,
  CommonService,
  SantanderDePosFlowService,
  SantanderDePosApiService,
  DocsManagerService,
  BaseFinishContainerComponent,
  docsManagerServiceFactory,
} from '@pe/checkout/santander-de-pos/shared';
import {
  ChangePaymentDataInterface,
  FlowStateEnum,
  NodePaymentResponseInterface,
} from '@pe/checkout/types';

import { EditFinishStorageService } from '../../services';

type PaymentResponseInterface = NodePaymentResponseInterface<NodePaymentDetailsResponseInterface>;

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [
    CommonService,
    EditFinishStorageService,
    SantanderDePosFlowService,
    SantanderDePosApiService,
    {
      provide: DocsManagerService,
      useFactory: docsManagerServiceFactory,
    },
  ],
  selector: 'santander-de-pos-inquire-edit-container',
  templateUrl: './finish-edit-container.component.html',
  styles: [':host { display: block; }'],
})
export class FinishEditContainerComponent
  extends BaseFinishContainerComponent
  implements OnInit {

  protected editTransactionStorageService = this.injector.get(EditTransactionStorageService);
  protected editFinishStorageService = this.injector.get(EditFinishStorageService);
  protected actions$ = this.injector.get(Actions);
  private ngZone = this.injector.get(NgZone);

  minHeightValue = 250;
  isNeedUpdating = true;

  @Input() isBillingAddressStepVisible = false;
  // For payment widgets when we have many payments in flow but behava like only one
  @Input() isDisableChangePayment = true;
  @Input() showCloseButton = false;

  @Output() changePaymentMethod: EventEmitter<ChangePaymentDataInterface> = new EventEmitter();
  @Output() closeButtonClicked: EventEmitter<any> = new EventEmitter();

  get transactionDetails(): any {
    return this.editTransactionStorageService.getTransactionData(this.flow.id, this.paymentMethod)?.paymentDetails;
  }

  get transactionId(): string {
    return this.editTransactionStorageService.getTransactionId(this.flow.id, this.paymentMethod);
  }

  protected get isPaymentComplete(): boolean {
    const paymentResponse: NodePaymentResponseInterface<NodePaymentDetailsResponseInterface>
      = this.nodeFlowService.getFinalResponse();

    return Boolean(this.flow
      && [FlowStateEnum.FINISH, FlowStateEnum.CANCEL].indexOf(this.flow.state) >= 0)
      && !this.isPaymentUpdateRequired(paymentResponse);
  }

  showFinishModalFromExistingPayment(): void {
    this.nodeFlowService.updatePayment<NodePaymentDetailsResponseInterface>().pipe(
      catchError((err) => {
        this.errorMessage = err.message;
        this.cdr.detectChanges();

        return of(null);
      }),
      tap((payment) => {
        this.paymentResponse = payment;
        this.cdr.detectChanges();
      }),
      switchMap(() => this.handleSignedStatus()),
    ).subscribe();
  }

  onChangeContainerHeight(height: number): void {
    this.ngZone.onStable.pipe(
      first(),
      tap({
        next: () => {
          this.minHeightValue = height;
          this.cdr.markForCheck();
        },
      }),
    ).subscribe();
  }

  handleSignedStatus(): Observable<PaymentResponseInterface> {
    const paymentResponse: PaymentResponseInterface = this.nodeFlowService.getFinalResponse();
    const cancelSigningRequest = this.editFinishStorageService.getEditCancelSigningRequest();

    return this.commonService.removeSignedStatus(paymentResponse, cancelSigningRequest).pipe(
      tap(() => {
        this.editFinishStorageService.removeEditCancelSigningRequest();
      }),
      switchMap(() => this.commonService.manageDocument(this.flow, paymentResponse)),
    );
  }

  paymentCallback(): Observable<PaymentResponseInterface> {
    return this.handleSignedStatus().pipe(
      switchMap(() => this.runUpdatePaymentWithTimeout())
    );
  }
}
