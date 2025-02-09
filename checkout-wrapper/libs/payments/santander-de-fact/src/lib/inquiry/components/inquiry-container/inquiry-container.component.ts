import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  EventEmitter,
  Output,
} from '@angular/core';
import { SelectSnapshot } from '@ngxs-labs/select-snapshot';
import { Store } from '@ngxs/store';
import { Subject, merge, of, throwError } from 'rxjs';
import { catchError, map, retryWhen, shareReplay, tap } from 'rxjs/operators';

import { NodeFlowService } from '@pe/checkout/node-api';
import { AbstractPaymentDetailsContainerInterface, PaymentSubmissionService } from '@pe/checkout/payment';
import { FlowState, ParamsState, PaymentState } from '@pe/checkout/store';
import { FlowInterface, FlowStateEnum, PaymentMethodEnum } from '@pe/checkout/types';
import { PeDestroyService } from '@pe/destroy';

import { FormInterface } from '../../../shared';
import { RequestDocsService } from '../../services';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'santander-de-fact-inquiry-container',
  templateUrl: './inquiry-container.component.html',
  styles: [`
    :host {
      display: block;
      margin-top: 15px;
    }
  `],
  providers: [PeDestroyService],
})
export class InquiryContainerComponent implements AbstractPaymentDetailsContainerInterface {

  @SelectSnapshot(FlowState.flow) public flow!: FlowInterface;

  @SelectSnapshot(FlowState.paymentMethod) public paymentMethod!: PaymentMethodEnum;

  @SelectSnapshot(ParamsState.embeddedMode) public embeddedMode: boolean;

  @SelectSnapshot(ParamsState.merchantMode) public merchantMode: boolean;

  @Output() continue = new EventEmitter<void>();

  public errorMessage: string;
  public showInquiryForm = false;

  private paymentDetails = this.store.selectSnapshot(PaymentState.details);
  private documentsSubject$ = new Subject<void>();
  public docs$ = this.requestDocsService.requestDocs(this.paymentDetails).pipe(
    tap((docsResponse) => {
      if (!docsResponse.contractPdfUrl || this.flow?.channel !== 'pos') {
        this.flow.state !== FlowStateEnum.FINISH && this.continue.next();
      } else {
        this.showInquiryForm = true;
      }
    }),
    catchError((error) => {
      this.errorMessage = error.message;
      this.cdr.markForCheck();

      return throwError(error);
    }),
    retryWhen(() => this.documentsSubject$),
    shareReplay(1),
  );

  public loading$ = merge(
    of(true),
    this.docs$.pipe(map(() => false)),
    merge(
      this.documentsSubject$,
      this.continue,
    ).pipe(
      map(() => true),
    ),
  );

  public readonly translations = {
    updateRatesText: $localize `:@@action.update_rates:`,
    sendInquiryText: $localize `:@@action.send_inquiry:`,
  };

  constructor(
    public cdr: ChangeDetectorRef,
    private store: Store,
    private nodeFlowService: NodeFlowService,
    private requestDocsService: RequestDocsService,
    private submit$: PaymentSubmissionService,
  ) {}

  public onSend(formData: FormInterface): void {
    this.nodeFlowService.assignPaymentDetails(formData);
    this.continue.next();
  }

  public tryAgain(): void {
    this.errorMessage = null;
    this.cdr.markForCheck();
    this.documentsSubject$.next();
  }

  public submit(): void {
    this.submit$.next();
  }
}
