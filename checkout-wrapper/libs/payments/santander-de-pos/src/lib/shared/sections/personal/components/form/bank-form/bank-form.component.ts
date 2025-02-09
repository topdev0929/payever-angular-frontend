import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { Validators } from '@angular/forms';
import { startWith, takeUntil, tap } from 'rxjs/operators';

import { ANALYTICS_FORM_SETTINGS } from '@pe/checkout/analytics';
import { CompositeForm } from '@pe/checkout/forms';
import { ibanMaskFn, ibanUnmaskFn, ibanValidator } from '@pe/checkout/forms/iban';
import {
  BankFormValue,
  PERSON_TYPE,
} from '@pe/checkout/santander-de-pos/shared';


const ANALYTICS_FORM_NAME = 'FORM_PAYMENT_BANK';

@Component({
  selector: 'bank-form',
  templateUrl: './bank-form.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [{
    provide: ANALYTICS_FORM_SETTINGS,
    useValue: {
      formName: ANALYTICS_FORM_NAME,
    },
  }],
})
export class BankFormComponent extends CompositeForm<BankFormValue> implements OnInit {
  public personType = this.injector.get(PERSON_TYPE);


  public readonly formGroup = this.fb.group({
    bankIBAN: this.fb.control<string>(null, [Validators.required, ibanValidator]),
    bankBIC: this.fb.control<string>(null, Validators.required),
  });

  public readonly ibanMask = ibanMaskFn;
  public readonly ibanUnmask = ibanUnmaskFn;

  ngOnInit(): void {
    super.ngOnInit();

    this.formGroup.get('bankIBAN').valueChanges.pipe(
      startWith(this.formGroup.get('bankIBAN').value),
      tap((value: string) => {
        value?.trim().length >= 2 && !value.toUpperCase().startsWith('DE')
          ? this.formGroup.get('bankBIC').enable()
          : this.formGroup.get('bankBIC').disable();
      }),
      takeUntil(this.destroy$),
    ).subscribe();
  }
}
