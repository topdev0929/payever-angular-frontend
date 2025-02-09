import {
  Component,
  ChangeDetectionStrategy,
  EventEmitter,
  Output,
  ViewChild,
  OnInit,
  Input,
  NgZone,
} from '@angular/core';
import { SelectSnapshot } from '@ngxs-labs/select-snapshot';
import dayjs from 'dayjs';
import { EMPTY, Observable, Subject, throwError } from 'rxjs';
import { catchError, delay, first, map, shareReplay, switchMap, tap } from 'rxjs/operators';

import { ApiService, TrackingService } from '@pe/checkout/api';
import { ModeEnum } from '@pe/checkout/form-utils';
import { PaymentSubmissionService } from '@pe/checkout/payment';
import { FlowState } from '@pe/checkout/store';
import { FinanceTypeEnum, FlowInterface, RateSummaryInterface, TimestampEvent } from '@pe/checkout/types';
import { CustomElementService, LocaleConstantsService, PeCurrencyPipe } from '@pe/checkout/utils';
import { PeDestroyService } from '@pe/destroy';

import {
  BaseContainerComponent,
  SantanderSeFlowService,
  FormInterface,
  RateInterface,
  SeTrackingService,
} from '../../../shared';
import { FormComponent } from '../form/form.component';

/**
 * This is basically our root level container component. We cannot use root
 * element for 'container' role, because it mostly works as a bootstrap component
 */
@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [ PeCurrencyPipe, PeDestroyService ],
  selector: 'santander-se-rates-container',
  templateUrl: './rates-container.component.html',
  styles: [':host { display: block; } .icon-64 { width: 68px; }'],
})
export class RatesContainerComponent extends BaseContainerComponent implements OnInit {

  @SelectSnapshot(FlowState.flow) flow: FlowInterface;

  @Input() mode: ModeEnum;

  @Output() selectRate: EventEmitter<RateSummaryInterface> = new EventEmitter();
  @Output() continue: EventEmitter<TimestampEvent> = new EventEmitter();
  @Output() buttonText: EventEmitter<string> = new EventEmitter();

  doSubmit$: Subject<void> = new Subject();
  totalAmount: number;

  @ViewChild('form') formElem: FormComponent;

  private showFinishWrapperSubject$ = new Subject<{ [key: string]: any }>();
  showFinishWrapper$ = this.showFinishWrapperSubject$.pipe(
    shareReplay(1),
  );

  finishWrapperButtons$ = this.showFinishWrapperSubject$.pipe(
    map(value => value?.error
      ? {
          retry: {
            click: () => this.retryAuthentication(),
            title: $localize `:@@santander-se.action.try_again:`,
            classes: 'btn btn-primary btn-link',
          },
        }
      : null
    ),
  );

  protected apiService = this.injector.get(ApiService);
  protected currencyPipe = this.injector.get(PeCurrencyPipe);
  protected localeConstantsService = this.injector.get(LocaleConstantsService);
  protected santanderSeFlowService = this.injector.get(SantanderSeFlowService);
  protected customElementService = this.injector.get(CustomElementService);
  private trackingService = this.injector.get(TrackingService);
  private seTrackingService = this.injector.get(SeTrackingService);
  private ngZone = this.injector.get(NgZone);
  private submit$ = this.injector.get(PaymentSubmissionService);

  ngOnInit(): void {
    super.ngOnInit();
    this.trackingService.doEmitPaymentStepReached(this.flow.id, this.paymentMethod, 0);

    this.totalAmount = this.flow.total;

    (window as any).PayeverStatic?.SvgIconsLoader?.loadIcons(
      ['bankid'],
      null,
      this.customElementService.shadowRoot
    );
  }

  triggerSubmit(): void {
    this.submit$.next();
  }

  onSelectRate(rate: RateInterface): void {
    if (this.flow && rate) {
      const monthlyCostStr: string = this.currencyPipe.transform(rate.monthlyCost, this.flow.currency, 'symbol-narrow');
      const durationStr: string = rate.months > 1
        ? $localize `:@@santander-se.credit_rates.months:`
        : $localize `:@@santander-se.credit_rates.month:`;
      const duration = `${rate.months} ${durationStr}`;

      const rateInfo: RateSummaryInterface = {
        chooseText: null, // Not needed
        totalAmount: rate.totalCost,
        downPayment: 0,
      };

      let chooseText: string = null;
      if (rate.payLaterType) {
        const moment = dayjs().add(rate.months, 'months');
        const month: string = moment.locale(this.localeConstantsService.getLang()).format('MMMM').toLowerCase();
        chooseText = $localize `:@@santander-se.credit_rates.rate_title_bnpl:\
          ${this.currencyPipe.transform(rate.totalCost, this.flow.currency, 'symbol-narrow')}:totalCost:\
          ${month}:monthName:`;
      } else {
        chooseText = this.flow.financeType === FinanceTypeEnum.FINANCE_CALCULATOR
          ? $localize `:@@santander-se.credit_rates.actions.rate_choose_summary_finance_calc:${monthlyCostStr}:totalCost:${duration}:duration:`
          : $localize `:@@santander-se.credit_rates.actions.rate_choose_summary:${monthlyCostStr}:monthlyCost:${duration}:duration:`;
      }

      this.nodeFlowService.assignPaymentDetails({ rate });

      this.selectRate.emit(rateInfo);
      this.buttonText.next(chooseText);
    } else {
      this.selectRate.emit(null);
      this.buttonText.next($localize `:@@santander-se.credit_rates.error.rates_list_empty:`);
    }
  }

  onRatesLoadingError(isError: boolean): void {
    if (isError) {
      this.selectRate.emit(null);
      this.buttonText.next($localize `:@@santander-se.action.try_again:`);
    }
  }

  onSubmitted(data: FormInterface): void {
    const { socialSecurityNumber } = data.ssnForm;

    this.showFinishWrapperSubject$.next({
      title: $localize `:@@santander-se.inquiry.finish.ssn_processing.title:`,
      text: $localize `:@@santander-se.inquiry.finish.ssn_processing.text:`,
      error: false,
    });
    this.cdr.detectChanges();

    this.initiateAuthentication(socialSecurityNumber).pipe(
      switchMap(() => this.getSSNDetails(socialSecurityNumber).pipe(
        tap((inquiryId: string) => {
          this.formElem.setInquiryId(inquiryId);
        }),
        switchMap(inquiryId => this.santanderSeFlowService.getApplication(
          inquiryId,
          false,
        ).pipe(
          tap(response => this.formElem.setSalesScoringType(response.salesScoringType)),
          tap(() => {
            this.ngZone.onStable.pipe(
              first(),
              tap(() => {
                this.showFinishWrapperSubject$.next(null);
                this.cdr.detectChanges();
                this.trackingService?.doEmitRateStepPassed(this.flow.id, this.paymentMethod);
                this.seTrackingService.doEmitBankIdStepPassed(this.flow.id, this.paymentMethod);
                this.continue.next();
              })
            ).subscribe();

          }),
        )),
        catchError((err) => {
          this.errors = { socialSecurityNumber: err?.message || 'Cant get SSN data' };

          return throwError(err);
        })
      )),
      catchError(() => {
        this.showFinishWrapperSubject$.next({
          title: $localize `:@@santander-se.inquiry.finish.ssn_error.title:`,
          text: $localize `:@@santander-se.inquiry.finish.ssn_error.text:`,
          error: true,
        });
        this.cdr.detectChanges();

        return EMPTY;
      }),
    ).subscribe();
  }

  retryAuthentication(): void {
    this.showFinishWrapperSubject$.next(null);
    this.triggerSubmit();
  }

  private initiateAuthentication(ssn: string): Observable<any> {
    return this.santanderSeFlowService.initiateAuthentication(ssn);
  }

  private getSSNDetails(ssn: string): Observable<string> {
    return this.santanderSeFlowService.getSSNDetailsOnce(
      this.formatSSN(ssn),
      this.totalAmount
    ).pipe(
      delay(200),
      map((details) => {
        this.santanderSeFlowService.extendAddressIfNotFilled({
          firstName: details.name.split(' ')[0],
          lastName: details.name.split(' ').slice(1).join(' '),
          city: details.city,
          street: details.address,
          streetName: details.address,
          zipCode: details.zipCode,
        });

        return details.inquiryId;
      })
    );
  }

  private formatSSN(ssn: string): string {
    return `${ssn.replace(/\D/g, '')}`;
  }
}
