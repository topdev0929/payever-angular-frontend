import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { Validators } from '@angular/forms';
import { startWith, takeUntil, tap } from 'rxjs/operators';

import { CompositeForm } from '@pe/checkout/forms';
import { ibanMaskFn, ibanUnmaskFn } from '@pe/checkout/forms/iban';
import { PeDestroyService } from '@pe/destroy';

import { BankFormValue } from '../../..';

import { ibanValidator } from './iban.validator';

@Component({
  selector: 'bank-form',
  templateUrl: './bank-form.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [PeDestroyService],
})
export class BankFormComponent extends CompositeForm<BankFormValue> implements OnInit {

  public readonly formGroup = this.fb.group({
    bank_i_b_a_n: this.fb.control<string>(null, [Validators.required, ibanValidator]),
    bank_b_i_c: this.fb.control<string>(null, [Validators.required]),
    bank_account_bank_name: this.fb.control<string>(null, [Validators.required]),
  });

  public readonly ibanMask = ibanMaskFn;
  public readonly ibanUnmask = ibanUnmaskFn;

  ngOnInit(): void {
    super.ngOnInit();

    const toggleBic$ = this.formGroup.get('bank_i_b_a_n').valueChanges.pipe(
      startWith<string>(this.formGroup.get('bank_i_b_a_n').value),
      tap((iban) => {
        const isNotGermanIban = iban
          && iban.trim().length >= 2
          && iban.trim().slice(0, 2).toLocaleUpperCase() !== 'DE';

        if (isNotGermanIban) {
          this.formGroup.get('bank_b_i_c').enable();
          this.formGroup.get('bank_account_bank_name').enable();
        } else {
          this.formGroup.get('bank_b_i_c').disable();
          this.formGroup.get('bank_account_bank_name').disable();
        }
      }),
    );

    toggleBic$.pipe(
      takeUntil(this.destroy$),
    ).subscribe();
  }
}
