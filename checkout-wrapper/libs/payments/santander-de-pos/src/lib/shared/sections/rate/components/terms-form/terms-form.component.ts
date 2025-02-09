import { ChangeDetectionStrategy, Component, OnInit, inject } from '@angular/core';
import { Validators } from '@angular/forms';
import { SelectSnapshot } from '@ngxs-labs/select-snapshot';
import { Store } from '@ngxs/store';
import { Observable, combineLatest } from 'rxjs';
import { distinctUntilChanged, map, startWith, takeUntil, tap } from 'rxjs/operators';

import { AnalyticConsentEventEnum } from '@pe/checkout/analytics';
import { CompositeForm } from '@pe/checkout/forms';
import {
  ConditionInterface,
  TermsFormValue,
} from '@pe/checkout/santander-de-pos/shared';
import { ParamsState, PaymentState } from '@pe/checkout/store';
import { PeDestroyService } from '@pe/destroy';

@Component({
  selector: 'terms-form',
  templateUrl: './terms-form.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  styles: [`
    .form-table {
      display: flex;
      flex-direction: column;
    }
  `],
  providers: [PeDestroyService],
})
export class TermsFormComponent extends CompositeForm<TermsFormValue> implements OnInit {
  @SelectSnapshot(ParamsState.merchantMode) public merchantMode!: boolean;

  private store = inject(Store);

  public readonly analyticConsentEventEnum = AnalyticConsentEventEnum;

  public readonly formGroup = this.fb.group({
    forOwnAccount: [
      { disabled: !this.merchantMode, value: null },
      Validators.requiredTrue,
    ],
    _borrowerAgreeToBeAdvised: [
      {
        disabled: !this.merchantMode,
        value: null,
      },
    ],
    dataPrivacy: [
      {
        disabled: !this.merchantMode,
        value: null,
      },
      Validators.requiredTrue,
    ],
    _agreeToBeAdvised: [
      {
        disabled: this.merchantMode,
        value: null,
      },
    ],
    advertisementConsent: [
      {
        disabled: !this.merchantMode,
        value: null,
      },
    ],
    customerConditionsAccepted: [null],
    webIdConditionsAccepted: [
      {
        disabled: !this.merchantMode,
        value: null,
      },
      Validators.requiredTrue,
    ],
  });

  public readonly translations = {
    selfModeText: $localize `:@@payment-santander-de-pos.inquiry.form.term.self_note_below:${'#'}:url:`,
    merchantModeText: $localize `:@@payment-santander-de-pos.inquiry.form.term.merchant_note_below:${'#'}:url:`,
    forOwnAccount: $localize `:@@payment-santander-de-pos.inquiry.form._borrowerActsOnItsOwnAccount.label:`,
    _borrowerAgreeToBeAdvised: $localize `:@@payment-santander-de-pos.inquiry.form._borrowerAgreeToBeAdvised.label:`,
    dataPrivacy: $localize `:@@payment-santander-de-pos.inquiry.form._borrowerWasGivenRelevantPrivacyPolicy.label:`,
    webIdConditionsAccepted: $localize `:@@payment-santander-de-pos.inquiry.form.webIdConditionsAccepted.label:`,
    _agreeToBeAdvised: $localize `:@@payment-santander-de-pos.inquiry.form._agreeToBeAdvised.label:`,
  };

  private readonly options$ = this.store.select(PaymentState.options);
  public readonly formData$ = this.store.select(PaymentState.form).pipe(
    map(formData => formData?.detailsForm ?? null),
  );

  public readonly isComfortCardCondition$: Observable<boolean> = combineLatest([
    this.options$,
    this.formData$,
  ]).pipe(
    map(([options, detailsForm]) => !!options.conditions
      .find((c: ConditionInterface) => c.programs.find(program => program.key === detailsForm?.condition)
        && c.isComfortCardCondition)
    ),
    takeUntil(this.destroy$),
  );

  ngOnInit(): void {
    super.ngOnInit();

    this.formGroup.valueChanges.pipe(
      startWith(this.formGroup.value),
      distinctUntilChanged( (prev, curr) =>
        prev._borrowerAgreeToBeAdvised === curr._borrowerAgreeToBeAdvised &&
        prev._agreeToBeAdvised === curr._agreeToBeAdvised &&
        prev.forOwnAccount === curr.forOwnAccount &&
        prev.dataPrivacy === curr.dataPrivacy
      ),
      tap(({ _borrowerAgreeToBeAdvised, _agreeToBeAdvised, forOwnAccount, dataPrivacy }) => {
        this.formGroup.patchValue({
          advertisementConsent: _borrowerAgreeToBeAdvised || _agreeToBeAdvised,
          customerConditionsAccepted: forOwnAccount && dataPrivacy,
        });
      }),
      takeUntil(this.destroy$),
    ).subscribe();
  }
}
