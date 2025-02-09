import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { Validators } from '@angular/forms';
import { SelectSnapshot } from '@ngxs-labs/select-snapshot';
import { Store } from '@ngxs/store';
import { combineLatest, merge } from 'rxjs';
import { map, takeUntil, tap } from 'rxjs/operators';

import { CompositeForm } from '@pe/checkout/forms';
import { FlowState, PaymentState } from '@pe/checkout/store';
import { PaymentMethodEnum } from '@pe/checkout/types';
import { PeDestroyService } from '@pe/destroy';

import { BOOLEAN_OPTIONS } from '../../../constants';

interface AmlFormValue {
  politicalExposedPerson: boolean;
  appliedOnBehalfOfOthers: boolean;
  payWithMainIncome: boolean;
  paySource: string;
  otherPaySource: string;
}

@Component({
  selector: 'santander-no-aml-form',
  templateUrl: './aml-form.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  styles: ['.icon { margin-left: 7px; }'],
  providers: [PeDestroyService],
})
export class AmlFormComponent extends CompositeForm<AmlFormValue> implements OnInit {

  @SelectSnapshot(FlowState.paymentMethod) private paymentMethod!: PaymentMethodEnum;

  private store = this.injector.get(Store);

  public formGroup = this.fb.group({
    politicalExposedPerson: [null, Validators.required],
    appliedOnBehalfOfOthers: [null, Validators.required],
    payWithMainIncome: [null, Validators.required],
    paySource: [
      {
        disabled: true,
        value: null,
      },
      Validators.required,
    ],
    otherPaySource: [
      {
        disabled: true,
        value: null,
      },
      Validators.required,
    ],
  });

  public readonly booleanOptions = BOOLEAN_OPTIONS;
  public readonly paySourceOptions$ = this.store.select(PaymentState.options).pipe(
    map(item => item.paySources)
  );

  public translations = {
    appliedOnBehalfOfOthers: {
      tooltip: $localize`:@@santander-no.inquiry.form.applied_on_behalf_of_others.tooltip:`,
    },
    politicalExposedPerson: {
      tooltip: $localize`:@@santander-no.inquiry.form.political_exposed_person.tooltip:`,
    },
  };

  ngOnInit(): void {
    super.ngOnInit();

    const paySourceStatus$ = this.formGroup.get('payWithMainIncome').valueChanges.pipe(
      tap((value) => {
        const amlEnabled = this.store.selectSnapshot(PaymentState.options)
          ?.isAmlEnabled;

        amlEnabled && !value
          ? this.formGroup.get('paySource').enable()
          : this.formGroup.get('paySource').disable();
      }),
    );

    const otherPaySourceStatus$ = combineLatest([
      this.formGroup.get('paySource').valueChanges,
      this.formGroup.get('paySource').statusChanges,
    ]).pipe(
      tap(([value, status]) => {
        value === 'OTHER' && status !== 'DISABLED'
          ? this.formGroup.get('otherPaySource').enable()
          : this.formGroup.get('otherPaySource').disable();
      }),
    );

    merge(
      paySourceStatus$,
      otherPaySourceStatus$,
    ).pipe(
      takeUntil(this.destroy$),
    ).subscribe();
  }
}
