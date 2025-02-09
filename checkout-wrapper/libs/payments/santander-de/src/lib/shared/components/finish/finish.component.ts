import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  Input,
  OnInit,
  ViewChild,
} from '@angular/core';
import { SelectSnapshot } from '@ngxs-labs/select-snapshot';
import { Store } from '@ngxs/store';
import { BehaviorSubject, interval, Subscription } from 'rxjs';
import { skipWhile, switchMap, takeUntil, tap } from 'rxjs/operators';

import { AbstractFinishComponent, ModalButtonListInterface } from '@pe/checkout/finish';
import { TopLocationService } from '@pe/checkout/location';
import { ExternalRedirectStorage } from '@pe/checkout/storage';
import { FlowState, ParamsState, PaymentState } from '@pe/checkout/store';
import { CheckoutStateParamsInterface, PaymentSpecificStatusEnum, PaymentStatusEnum } from '@pe/checkout/types';
import { PeDestroyService } from '@pe/destroy';

import { ApplicationFlowTypeEnum } from '../../constants';
import { SantanderDeFlowService } from '../../services';
import { FormConfigService } from '../../services';
import { NodePaymentDetailsInterface } from '../../types';

const TIMER_AMOUNT = 120;

@Component({
  changeDetection: ChangeDetectionStrategy.Default,
  selector: 'santander-de-inquiry-finish',
  templateUrl: './finish.component.html',
  providers: [PeDestroyService],
})
export class FinishComponent extends AbstractFinishComponent implements OnInit {

  @ViewChild('timer')
  set timer(timer: ElementRef<HTMLParagraphElement>) {
    if (timer?.nativeElement) {
      this.initTimer();
    }
  }

  @SelectSnapshot(ParamsState.params) private params: CheckoutStateParamsInterface;

  @Input() isCheckStatusProcessing = false;
  @Input() isWaitingForSignUrl = false;
  @Input() isProcessingSigning = false;
  @Input() isUpdatePaymentTimeout = false;

  timerText$ = new BehaviorSubject<string>(`${this.getTimerText(TIMER_AMOUNT)}`);

  translations = {
    applicationSuccessClickAndCollectFalse: $localize`:@@santander-de.inquiry.finish.application_success_click_and_collect_false.description:${'<strong>' + this.getButtonText() + '</strong>'}:buttonText:`,
  };

  private timerSubscription: Subscription;
  private applicationFlowType: ApplicationFlowTypeEnum;

  private formConfigService = this.injector.get(FormConfigService);
  private topLocationService = this.injector.get(TopLocationService);
  private externalRedirectStorage = this.injector.get(ExternalRedirectStorage);
  private santanderDeFlowService = this.injector.get(SantanderDeFlowService);
  private destroy$ = this.injector.get(PeDestroyService);
  private store = this.injector.get(Store);

  ngOnInit(): void {
    this.formConfigService.ApplicationFlowType$.pipe(
      tap((applicationFlowType) => {
        this.applicationFlowType = applicationFlowType;
      }),
      takeUntil(this.destroy$),
    ).subscribe();
  }

  get applicationNumberEx(): string {
    const number = this.applicationNumber
      ? this.applicationNumber.substring(10).slice(0, -2)
      : null;

    return Number(number)
      ? number
      : null;
  }

  private get finishOnContractCenter(): boolean {
    return this.store.selectSnapshot<
      NodePaymentDetailsInterface
    >(PaymentState.details)?.finishOnContractCenter;
  }

  private get hasTwoApplicants() {
    return this.applicationFlowType && this.applicationFlowType === ApplicationFlowTypeEnum.TwoApplicants;
  }

  override get buttons(): ModalButtonListInterface {
    const showButtons = !this.isStatusPending()
      && !this.needsAdditionalSteps()
      && !this.hasTwoApplicants;

    return showButtons
      ? super.buttons
      : {};
  }

  getTitle(): string {
    let result = String(this.status);
    if (this.isClickAndCollect()) {
      result = $localize`:@@santander-de.inquiry.finish.application_click_and_collect_true.title:`;
    } else if (this.status === PaymentStatusEnum.STATUS_ACCEPTED) {
      result = $localize`:@@santander-de-pos.inquiry.finish.application_success.title:`;
    } else if (this.status === PaymentStatusEnum.STATUS_IN_PROCESS) {
      result = $localize`:@@santander-de.inquiry.finish.application_in_process_click_and_collect_false.title:`;
    }

    return result;
  }

  getText(): string {
    let result: string = null;
    if (this.isClickAndCollect()) {
      result = $localize`:@@santander-de.inquiry.finish.application_click_and_collect_true.text:`;
    }
    if (this.isSuccessAndNotClickAndCollectAndWithLink()) {
      const applicationNumber = `<span class="big-application-number">${this.applicationNumberEx}</span>`;

      result = $localize`:@@santander-de.inquiry.finish.application_success_click_and_collect_false.text:${applicationNumber}:applicationNumber:`;
    }

    return result;
  }

  getButtonText(): string {
    return $localize`:@@santander-de.inquiry.finish.finish_application:`;
  }

  getTimerText(seconds: number): string {
    const timer = `<strong>${seconds}</strong>`;

    return $localize`:@@santander-de.inquiry.finish.application_success_click_and_collect_false.timer:${timer}:timer:`;
  }

  handleLinkClick($event: MouseEvent): void {
    // we need to handle click on link manually to be sure, that redirect worked
    // or we need to react if redirect was blocked

    this.store.selectOnce(FlowState.flow).pipe(
      switchMap(flow => this.externalRedirectStorage.saveDataBeforeRedirect(flow).pipe(
        tap(() => {
          const redirectUrl: string =
            this.nodeResult?.paymentDetails.signingCenterLink;
          if (redirectUrl) {
            try {
              $event.preventDefault();
              const win: Window = window.open(redirectUrl, '_blank');
              if (win) {
                if (this.successUrl) {
                  this.topLocationService.href = this.successUrl;
                }
                win.focus();
              } else {
                this.topLocationService.href = redirectUrl;
              }
            } catch (error) {
              this.topLocationService.href = redirectUrl;
            }
          }
        }),
      )),
    ).subscribe();
  }

  showSiningStatus(): boolean {
    return (
      !this.hasTwoApplicants
      && !this.finishOnContractCenter
      && !this.isClickAndCollect()
    ) && [
      PaymentSpecificStatusEnum.STATUS_IN_ENTSCHEIDUNG,
      PaymentSpecificStatusEnum.STATUS_ABGELEHNT,
      PaymentSpecificStatusEnum.STATUS_ZURUECKGESTELLT,
      PaymentSpecificStatusEnum.STATUS_ENTSCHEIDUNG_NAECHSTER_WERKTAG,
      PaymentSpecificStatusEnum.STATUS_IN_BEARBEITUNG,
    ].includes(this.specificStatus)
      || this.isProcessingSigningTimeout();
  }

  isProcessingSigningTimeout() {
    return this.isSiningInitiated() && this.isUpdatePaymentTimeout;
  }

  isClickAndCollect(): boolean {
    return this.nodeResult?.paymentDetails?.clickAndCollect;
  }

  isSuccessAndNotClickAndCollectAndWithLink(): boolean {
    return (
      (this.isStatusSuccess() || this.isStatusPending()) &&
      (
        this.finishOnContractCenter
        || (
          !this.isClickAndCollect()
          && this.hasTwoApplicants
          && this.nodeResult?.paymentDetails?.signingCenterLink
        )
      )
    );
  }

  isTimerShown(): boolean {
    return (
      this.isSuccessAndNotClickAndCollectAndWithLink() && !!this.successUrl
    );
  }

  private redirectToShopUrl(): void {
    if (this.getApiCallUrl()) {
      this.topLocationService.href = this.getApiCallUrl();
    }
  }

  private initTimer(): void {
    let timerAmount = TIMER_AMOUNT;
    this.timerSubscription = interval(1000)
      .pipe(
        skipWhile(() => this.isLoading && !this.isTimerShown()),
        tap(() => {
          timerAmount--;
          this.timerText$.next(this.getTimerText(timerAmount));
          if (timerAmount <= 0) {
            this.timerSubscription.unsubscribe();
            this.redirectToShopUrl();
          }
        }),
        takeUntil(this.destroy$)
      ).subscribe();
  }


  isStatusSuccess(): boolean {
    return (
      this.status === PaymentStatusEnum.STATUS_ACCEPTED
      && !this.isClickAndCollect()
    ) || [PaymentStatusEnum.STATUS_PAID].includes(this.status);
  }

  isStatusPending(): boolean {
    return (
      (!this.isStatusFail() && !this.showSiningStatus()) &&
      this.status === PaymentStatusEnum.STATUS_IN_PROCESS ||
      (this.status === PaymentStatusEnum.STATUS_ACCEPTED && this.isClickAndCollect())
    );
  }

  isStatusFail(): boolean {
    return !this.showSiningStatus()
      && !this.isCheckStatusProcessing
      && (super.isStatusFail() || this.isUpdatePaymentTimeout);
  }

  isStatusUnknown() {
    return !this.showSiningStatus() && super.isStatusUnknown();
  }

  needsAdditionalSteps() {
    return (
      !this.isProcessingSigningTimeout() &&
      !this.isStatusFail() &&
      (this.isStatusSuccess() || this.isStatusPending()) &&
      !this.hasTwoApplicants && !this.finishOnContractCenter
    );
  }

  isAdditionalStepsFinished(): boolean {
    return !this.isSiningFailed() && (
      this.isProcessingSigning
      || this.isSigned()
    );
  }

  isSigned(): boolean {
    return this.santanderDeFlowService.isSigned();
  }

  private isSiningInitiated(): boolean {
    return this.params.processed && !this.isSiningFailed();
  }

  private isSiningFailed(): boolean {
    return Boolean(this.params.redirectToPaymentQueryParams?.['identification-failed']);
  }
}
