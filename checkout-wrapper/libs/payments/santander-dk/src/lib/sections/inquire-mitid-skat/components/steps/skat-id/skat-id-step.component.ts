import { ChangeDetectionStrategy, Component } from '@angular/core';
import { Validators } from '@angular/forms';
import { Subject, combineLatest, defer, merge, of } from 'rxjs';
import { catchError, filter, map, startWith, switchMap, tap } from 'rxjs/operators';

import { FormValue } from '@pe/checkout/santander-dk/shared';
import { PatchFormState, PaymentState } from '@pe/checkout/store';

import { BaseStepComponent, StepTranslations, StepType } from '../base-step.component';

@Component({
  selector: 'skat-id-step',
  templateUrl: '../base-step.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SkatIdStepComponent extends BaseStepComponent {

  public formGroup = this.fb.group({
    _skatReady: this.fb.control<boolean>(null, Validators.required),
  });

  public readonly translations: StepTranslations = {
    login: $localize `:@@santander-dk.inquiry.step.mitid_skat.skat_body.login:`,
    status: {
      title: $localize `:@@santander-dk.inquiry.step.mitid_skat.skat_body.title:`,
      text: $localize `:@@santander-dk.inquiry.step.mitid_skat.skat_body.text:`,
    },
    actions: {
      login: $localize `:@@santander-dk.actions.mitid_login:`,
      continue: $localize `:@@santander-dk.actions.continue:`,
    },
  };

  protected readonly stepType = StepType.Skat;
  private readonly formData: FormValue = this.store
    .selectSnapshot(PaymentState.form);

  public isStepActive$ = defer(() => combineLatest([
    this.formGroup.get('_skatReady').valueChanges.pipe(
      startWith(this.formGroup.get('_skatReady').value),
    ),
    this.store.select(PaymentState.form).pipe(
      filter(v => Boolean(v)),
      map((form: FormValue) => !!form.mitIdForm?.debtorId),
    ),
  ]).pipe(
    map(([value, debtorId]) => !value && debtorId),
  ));

  private navigateSubject$ = new Subject<void>();
  private navigate$ = this.navigateSubject$.pipe(
    tap(() => {
      this.navigationError = null;
      this.externalNavigateData.clearValue(this.flow.id, 'failed');
    }),
    switchMap(() => this.flowService.prepareSkatAuthRedirect({
      applicationNumber: this.formData?.mitIdForm?.applicationNumber?.toString()
        || this.externalNavigateData.getValue(this.flow.id, 'applicationId'),
      debtorId: this.formData?.mitIdForm?.debtorId?.toString()
        || this.externalNavigateData.getValue(this.flow.id, 'debtorId'),
      frontPostBackUrl: this.wrapperUrl,
    }).pipe(
      catchError((error) => {
        this.navigationError = error.message;

        return of(null);
      }),
      switchMap(data => this.externalRedirectStorage.saveDataBeforeRedirect(this.flow).pipe(
        tap(() => {
          this.formRedirectData = data;
          this.cdr.detectChanges();
          (document.getElementById('formRedirectData') as HTMLFormElement)?.submit();
        }),
        map(() => true),
      )),
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
    this.store.dispatch(new PatchFormState({ skatIdForm: this.formGroup.value }));
  }

  public storage(): void {
    this.externalNavigateData.clearValue(this.flow.id, 'failed');
    this.cdr.markForCheck();
    this.formGroup.get('_skatReady').setValue(true);
    this.store.dispatch(new PatchFormState({ skatIdForm: this.formGroup.value }));
  }
}
