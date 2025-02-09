import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { Validators } from '@angular/forms';
import { Subject, defer, merge, of } from 'rxjs';
import { catchError, filter, map, startWith, switchMap, takeUntil, tap, withLatestFrom } from 'rxjs/operators';

import { FlowStorage } from '@pe/checkout/storage';
import { PatchFormState, PaymentState, SetPayments } from '@pe/checkout/store';

import { BaseStepComponent, StepTranslations, StepType } from '../base-step.component';

@Component({
  selector: 'mit-id-step',
  templateUrl: '../base-step.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MitIdStepComponent extends BaseStepComponent {

  private flowStorage = inject(FlowStorage);
  public formGroup = this.fb.group({
    debtorId: this.fb.control<string>(
      this.externalNavigateData.getValue(this.flow.id, 'debtorId'),
      Validators.required,
    ),
    applicationNumber: this.fb.control<string>(
      this.externalNavigateData.getValue(this.flow.id, 'applicationId'),
      Validators.required,
    ),
  });

  public readonly translations: StepTranslations = {
    login: $localize `:@@santander-dk.inquiry.step.mitid_skat.mitid_body.login:`,
    status: {
      title: $localize `:@@santander-dk.inquiry.step.mitid_skat.mitid_body.title:`,
      text: $localize `:@@santander-dk.inquiry.step.mitid_skat.mitid_body.text:`,
    },
    actions: {
      login: $localize `:@@santander-dk.actions.mitid_login:`,
      continue: $localize `:@@santander-dk.actions.continue:`,
    },
  };

  public isStepActive$ = defer(() => this.formGroup.get('debtorId').valueChanges.pipe(
    startWith(this.formGroup.get('debtorId').value),
    map(value => !value),
  ));

  protected readonly stepType = StepType.MitId;
  private navigateSubject$ = new Subject<void>();
  private navigate$ = this.navigateSubject$.pipe(
    tap(() => {
      this.navigationError = null;
      this.externalNavigateData.clearValue(this.flow.id, 'failed');
    }),
    withLatestFrom(this.store.select(PaymentState.form)),
    switchMap(([_, formData]) => this.flowService.prepareMitIDAuthRedirect({
      productId: Number(formData.ratesForm.productId),
      duration: Number(formData.ratesForm.creditDurationInMonths),
      frontPostBackUrl: this.wrapperUrl,
    }).pipe(
      switchMap((data) => {
        this.formGroup.get('applicationNumber').setValue(data.applicationNumber?.toString());

        return this.store.dispatch(new PatchFormState({ mitIdForm: this.formGroup.value })).pipe(
          switchMap(() => this.redirect(data.redirectUrl))
        );
      }),
      catchError(() => of(null)),
    )),
  );

  public loading$ = merge(
    this.navigateSubject$.pipe(map(() => true)),
    this.navigate$.pipe(
      filter(value => !value),
      map(() => false),
    ),
  );

  public navigate(): void {
    this.navigateSubject$.next();
  }

  public pass(): void {
    this.store.dispatch(new PatchFormState(this.formGroup.value));
  }

  public storage(): void {
    this.externalRedirectStorage.restoreAndClearData(this.flow.id).pipe(
      tap(() => {
        const data = this.flowStorage.getData(this.flow.id, 'paymentData');
        !!data && this.store.dispatch(new SetPayments(data));
        const debtorId = this.externalNavigateData.getValue(this.flow.id, 'debtorId');
        this.externalNavigateData.clearValue(this.flow.id, 'failed');
        this.formGroup.get('debtorId').setValue(debtorId);
        this.cdr.markForCheck();
        this.store.dispatch(new PatchFormState({ mitIdForm: this.formGroup.value }));
      }),
      takeUntil(this.destroy$),
    ).subscribe();

  }
}
