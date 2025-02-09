import {
  Component,
  ChangeDetectionStrategy,
  Input,
  ViewChild,
  ElementRef,
} from '@angular/core';
import { BehaviorSubject, interval } from 'rxjs';
import { takeUntil, takeWhile } from 'rxjs/operators';

import { AbstractFinishComponent } from '@pe/checkout/finish';
import { PaymentStatusEnum, PaymentSpecificStatusEnum } from '@pe/checkout/types';
import { PeDestroyService } from '@pe/destroy';

enum Workdays {
  Monday = 'monday',
  Tuesday = 'tuesday',
  Wednesnday = 'wednesday',
  Thursday = 'thursday',
  Friday = 'friday',
}

const TIMER_AMOUNT = 60;

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'santander-dk-finish',
  templateUrl: './finish.component.html',
  styleUrls: ['./finish.component.scss'],
})
export class FinishComponent extends AbstractFinishComponent {

  @Input() isCheckStatusProcessing = false;
  @Input() isCheckStatusTimeout = false;

  @ViewChild('timer')
  set timer(timer: ElementRef<HTMLParagraphElement>) {
    if (timer?.nativeElement && !this.isPosPayment()) {
      this.initTimer();
    }
  }

  isApproved = false;

  timerText$ = new BehaviorSubject<string>(`${this.getTimerText(TIMER_AMOUNT)}`);

  private destroy$ = this.injector.get(PeDestroyService);

  get isShowApprovedIframe(): boolean {
    return this.status === PaymentStatusEnum.STATUS_IN_PROCESS &&
      this.specificStatus === PaymentSpecificStatusEnum.STATUS_APPROVED;
  }

  get successLink(): string {
    return this.nodeResult.paymentDetails?.frontendSuccessUrl;
  }

  get signingLink(): string {
    return this.nodeResult.paymentDetails?.signingLink;
  }

  get contractUrl(): string {
    return this.nodeResult?.paymentDetails?.documentSigningUrl;
  }

  get translations() {
    return {
      processingTitle: $localize`:@@santander-dk.inquiry.finish.application_check_status_processing.title:`,
      processingText: $localize`:@@santander-dk.inquiry.finish.application_check_status_processing.text:`,
      contactsNote: $localize`:@@santander-dk.inquiry.finish.application_pending.contacts_note:`,
      openingHoursTitle: $localize`:@@santander-dk.inquiry.finish.application_pending.opening_hours.title:`,
      workdays: Object.values(Workdays).map(day => ({
        title: $localize`:@@santander-dk.inquiry.finish.application_pending.opening_hours.workday.title:${day}:day:`,
        hours: $localize`:@@santander-dk.inquiry.finish.application_pending.opening_hours.workday.hours:`,
      })),
      saturdayTitle: $localize`:@@santander-dk.inquiry.finish.application_pending.opening_hours.saturday.title:`,
      saturdayHours: $localize`:@@santander-dk.inquiry.finish.application_pending.opening_hours.saturday.hours:`,
      sundayTitle: $localize`:@@santander-dk.inquiry.finish.application_pending.opening_hours.sunday.title:`,
      sundayHours: $localize`:@@santander-dk.inquiry.finish.application_pending.opening_hours.sunday.hours:`,
      finishDescription: !this.isPosPayment()
        ? $localize`:@@santander-dk.inquiry.finish.application_success.finish_application_description:`
        : $localize`:@@santander-dk.inquiry.finish.application_success.finish_application_description_pos:`,
    };
  }

  getTimerText(seconds: number): string {
    return $localize`:@@santander-dk.inquiry.finish.application_success.finish_application_timer:${seconds}:timer:`;
  }


  handleLinkClick(): void {
    if (this.isValidUrl(this.signingLink)) {
      window.open(this.signingLink, '_blank');
    }

    if (!this.isPosPayment()) {
      window.location.href = this.successLink;
    }
  }

  isStatusSuccess(): boolean {
    return (
      this.specificStatus === PaymentSpecificStatusEnum.STATUS_SIGNED
      || this.isShowApprovedIframe // It's here to call hidden success_url
      || [PaymentStatusEnum.STATUS_PAID].includes(this.status)
    );
  }

  isStatusPending(): boolean {
    return (
      this.specificStatus === PaymentSpecificStatusEnum.STATUS_PENDING ||
      this.specificStatus === PaymentSpecificStatusEnum.STATUS_CONTROL
    );
  }

  isStatusFail(): boolean {
    return (
      this.status === PaymentStatusEnum.STATUS_FAILED ||
      this.status === PaymentStatusEnum.STATUS_DECLINED ||
      this.status === PaymentStatusEnum.STATUS_CANCELLED
    );
  }

  private initTimer(): void {
    let timerAmount = TIMER_AMOUNT;

    interval(1000).pipe(
      takeWhile(() => (!this.isApproved && timerAmount > 0)),
      takeUntil(this.destroy$)
    ).subscribe(() => {
      this.timerText$.next(this.getTimerText(--timerAmount));

      if (timerAmount <= 0) {
        window.location.href = this.successLink;
      }
    });
  }

  isValidUrl(value: string): boolean {
    try {
      return value && !!new URL(value);
    } catch (err) {
      return false;
    }
  }

  protected _onStatusSuccess() {
    // It is necessary to prevent the output of the button in the footer of the modal.
    // This action is executed in a timer

    return;
  }
}
