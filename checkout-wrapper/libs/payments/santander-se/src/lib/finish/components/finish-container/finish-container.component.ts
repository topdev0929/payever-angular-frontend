import { coerceBooleanProperty } from '@angular/cdk/coercion';
import { ChangeDetectionStrategy, Component, OnInit, inject } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { filter, takeUntil, tap } from 'rxjs/operators';

import { AbstractFinishContainerComponent } from '@pe/checkout/finish';
import { SectionStorageService } from '@pe/checkout/form-utils';
import { ExternalNavigateData } from '@pe/checkout/storage';
import { NodePaymentResponseInterface } from '@pe/checkout/types';
import { prepareData } from '@pe/checkout/utils/prepare-data';

import {
  NodePaymentResponseDetailsInterface,
  SantanderSePaymentProcessService,
  SantanderSePaymentStateService,
  UpdatePaymentModeEnum,
} from '../../../shared';


@Component({
  selector: 'santander-se-finish-container',
  templateUrl: './finish-container.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [
    SantanderSePaymentProcessService,
  ],
})
export class FinishContainerComponent
  extends AbstractFinishContainerComponent<NodePaymentResponseDetailsInterface>
  implements OnInit {

  protected externalNavigateData = inject(ExternalNavigateData);
  private santanderSeProcessPaymentService = inject(SantanderSePaymentProcessService);
  private paymentStateService = inject(SantanderSePaymentStateService);
  private sectionStorageService = inject(SectionStorageService);

  updating$ = new BehaviorSubject(false);

  protected get isPaymentComplete(): boolean {
    const complete = coerceBooleanProperty(this.externalNavigateData.getValue(this.flow.id, 'complete'));
    const paymentResponse = this.nodeFlowService.getFinalResponse();

    return (super.isPaymentComplete ||
      Boolean(paymentResponse
        && (this.sectionStorageService.isPassedPaymentData === null
        || this.sectionStorageService.isPassedPaymentData)
      )) && !complete && !this.activatedRoute.snapshot.queryParams.processed;
  }

  ngOnInit(): void {
    const paymentResponse = this.nodeFlowService.getFinalResponse();
    this.santanderSeProcessPaymentService.init(
      paymentResponse,
      prepareData.bind(this),
    );

    super.ngOnInit();

    this.paymentStateService.error$.pipe(
      tap(({ error, errorMessage }) => {
        this.errors = error;
        this.errorMessage = errorMessage;
        this.cdr.detectChanges();
      }),
      takeUntil(this.destroy$)
    ).subscribe();

    this.paymentStateService.isCheckStatusProcessing$.pipe(
      filter(d => !d),
      tap(() => {
        this.paymentResponse = this.nodeFlowService.getFinalResponse();
        this.cdr.detectChanges();
      }),
      takeUntil(this.destroy$)
    )
    .subscribe();
  }

  onStartSigning(): void {
    this.santanderSeProcessPaymentService.onStartSigning();
  }

  protected paymentCallback(): Observable<NodePaymentResponseInterface<NodePaymentResponseDetailsInterface>> {
    this.paymentResponse = null;
    this.updating$.next(true);
    const complete = coerceBooleanProperty(this.externalNavigateData.getValue(this.flow.id, 'complete'));
    const mode = complete ? UpdatePaymentModeEnum.ProcessingSigning : UpdatePaymentModeEnum.WaitingForSigningURL;

    return this.santanderSeProcessPaymentService.runUpdatePaymentWithTimeout(
      mode
    ).pipe(
      tap(() => {
        this.paymentResponse = this.paymentStateService.paymentResponse;
        this.updating$.next(false);
      })
    );
  }

  showFinishModalFromExistingPayment(): void {
    this.paymentResponse ||= this.nodeFlowService.getFinalResponse();
    this.cdr.detectChanges();
  }
}
