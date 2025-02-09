import { ChangeDetectionStrategy, Component, EventEmitter, Output } from '@angular/core';
import { Validators } from '@angular/forms';
import { Observable, Subject, combineLatest, defer, merge, of, throwError } from 'rxjs';
import {
  catchError,
  filter,
  map,
  startWith,
  switchMap,
  tap,
} from 'rxjs/operators';

import { PatchFormState, PaymentState } from '@pe/checkout/store';
import { NodeDenmarkFormConfigData, PollingError } from '@pe/checkout/types';
import { POLLING_CONFIG, pollWhile } from '@pe/checkout/utils/poll';

import { FormValue } from '../../../../../shared';
import { BaseStepComponent, StepTranslations, StepType } from '../base-step.component';

@Component({
  selector: 'bank-consent-step',
  templateUrl: '../base-step.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BankConsentStepComponent extends BaseStepComponent {

  @Output() submitted = new EventEmitter<void>();

  private pollingConfig = this.injector.get(POLLING_CONFIG);

  private get debtorId() {
    return this.formData?.mitIdForm?.debtorId
      || this.externalNavigateData.getValue(this.flow.id, 'debtorId');
  }

  private get applicationNumber() {
    return this.formData?.mitIdForm?.applicationNumber
      || this.externalNavigateData.getValue(this.flow.id, 'applicationId');
  }

  public formGroup = this.fb.group({
    _bankConsentReady: this.fb.control<boolean>(null, Validators.requiredTrue),
    _psd2Status: this.fb.control<boolean>(null, Validators.requiredTrue),

    wasCPRProcessed: this.fb.control<boolean>(null, Validators.required),
    wasTaxProcessed: this.fb.control<boolean>(null, Validators.required),
    _insuranceEnabled: this.fb.control<boolean>(null, Validators.required),
    _insuranceMonthlyCost: this.fb.control<number>(null, Validators.required),
    _insurancePercent: this.fb.control<number>(null, Validators.required),
  });

  public readonly translations: StepTranslations = {
    login: $localize `:@@santander-dk.inquiry.step.mitid_skat.bank_consent.login:`,
    status: {
      title: $localize `:@@santander-dk.inquiry.step.mitid_skat.bank_consent.title:`,
      text: $localize `:@@santander-dk.inquiry.step.mitid_skat.bank_consent.text:`,
    },
    actions: {
      login: $localize `:@@santander-dk.inquiry.step.mitid_skat.bank_consent.login:`,
      continue: $localize `:@@santander-dk.actions.continue:`,
    },
  };

  protected readonly stepType = StepType.BankConsent;
  private readonly formData: FormValue = this.store
    .selectSnapshot(PaymentState.form);

  public isStepActive$ = defer(() => combineLatest([
    this.formGroup.get('_bankConsentReady').valueChanges.pipe(
      startWith(this.formGroup.get('_bankConsentReady').value),
    ),
    this.store.select(PaymentState.form).pipe(
      filter(v => Boolean(v)),
      map((form: FormValue) => !!form.mitIdForm?.debtorId && !!form.skatIdForm?._skatReady),
    ),
  ]).pipe(
    map(([value, debtorId]) => !value && debtorId),
  ));

  public isReady$ = defer(() => this.formGroup.get('_bankConsentReady').valueChanges.pipe(
    startWith(this.formGroup.get('_bankConsentReady').value),
  ));

  private navigateSubject$ = new Subject<void>();
  private navigate$ = this.navigateSubject$.pipe(
    tap(() => {
      this.navigationError = null;
      this.externalNavigateData.clearValue(this.flow.id, 'failed');
    }),
    switchMap(() => this.flowService.prepareBankConsentRedirect({
      debtorId: String(this.formData.mitIdForm.debtorId),
      frontPostBackUrl: this.wrapperUrl,
    }).pipe(
      switchMap(data => this.redirect(data.url)),
    )),
  );

  private passSubject$ = new Subject<void>();
  private pass$ = this.passSubject$.pipe(
    tap(() => this.store.dispatch(new PatchFormState({ bankConsentForm: this.formGroup.value }))),
    switchMap(() => combineLatest([
      this.pollDenmarkFormConfig(),
      this.flowService.getInsuranceConfig({
        applicationNumber: String(this.applicationNumber),
        debtorId: String(this.debtorId),
        cpr: String((this.formData as any)?.cprForm?.socialSecurityNumber
          || this.flow.billingAddress?.socialSecurityNumber),
      }),
    ]).pipe(
      tap(([
        { cprProcess, taxProcess },
        { insuranceEnabled, insuranceMonthlyCost, insurancePercent },
      ]) => {
        this.formGroup.patchValue({
          wasCPRProcessed: cprProcess,
          wasTaxProcessed: taxProcess,
          _insuranceEnabled: insuranceEnabled,
          _insuranceMonthlyCost: insuranceMonthlyCost,
          _insurancePercent: insurancePercent,
        }, { emitEvent: false });

        this.store.dispatch(new PatchFormState({ bankConsentForm: this.formGroup.value }));
        this.submitted.emit();
      }),
      catchError((err) => {
        this.navigationError = err.message;

        return of(null);
      }),
    )),
  );

  public loading$ = merge(
    merge(
      this.navigateSubject$,
      this.passSubject$,
    ).pipe(
      map(() => true),
    ),
    merge(
      this.navigate$,
      this.pass$,
    ).pipe(
      filter(value => !value),
      map(() => false),
    ),
  );

  public navigate(): void {
    this.navigateSubject$.next();
  }

  public pass(): void {
    this.passSubject$.next();
  }

  public storage(): void {
    this.externalNavigateData.clearValue(this.flow.id, 'failed');
    const psd2Status = this.externalNavigateData.getValue(this.flow.id, 'psd2Status') === 'true';
    this.formGroup.patchValue({
      _bankConsentReady: true,
      _psd2Status: psd2Status,
    });
    this.cdr.markForCheck();
    this.store.dispatch(new PatchFormState({ bankConsentForm: this.formGroup.value }));
  }

  private pollDenmarkFormConfig(): Observable<NodeDenmarkFormConfigData> {
    const source$ = this.flowService.getFormConfig({
      applicationNumber: String(this.applicationNumber),
      debtorId: String(this.debtorId),
    });

    const condition = ({ cprProcess, taxProcess }: NodeDenmarkFormConfigData) =>
      typeof cprProcess === 'boolean' && typeof taxProcess === 'boolean';

    let lastResponse: NodeDenmarkFormConfigData;

    return source$.pipe(
      pollWhile(
        this.pollingConfig,
        value => !condition(value),
      ),
      tap(value => lastResponse = value),
      filter(condition),
      catchError(error => error instanceof PollingError && error.code === 'timeout'? of(lastResponse)
        : throwError(error)
      ),
    );
  }
}
