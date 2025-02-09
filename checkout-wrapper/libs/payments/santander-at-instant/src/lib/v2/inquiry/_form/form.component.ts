import { AsyncPipe, NgIf } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  EventEmitter,
  OnInit,
  Output,
  ViewChild,
  inject,
} from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { SelectSnapshot } from '@ngxs-labs/select-snapshot';
import { Store } from '@ngxs/store';
import { merge } from 'rxjs';
import { auditTime, map, takeUntil, tap } from 'rxjs/operators';

import { ANALYTICS_FORM_SETTINGS } from '@pe/checkout/analytics';
import { CheckoutFormsCoreModule } from '@pe/checkout/forms';
import { ibanMaskFn, ibanUnmaskFn, ibanValidator } from '@pe/checkout/forms/iban';
import { CheckoutFormsInputModule } from '@pe/checkout/forms/input';
import { PaymentSubmissionService } from '@pe/checkout/payment';
import { RatesModule as SdkRatesModule } from '@pe/checkout/rates';
import { FlowState, PatchFormState, PaymentState } from '@pe/checkout/store';
import { FlowInterface, PaymentMethodEnum } from '@pe/checkout/types';
import { CustomElementService } from '@pe/checkout/utils';
import { PeDestroyService } from '@pe/destroy';

import { FormInterface, FormOptionsInterface } from '../../../shared';

const ANALYTICS_FORM_NAME = 'FORM_PAYMENT_BANK';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'pe-santander-at-instant-inquiry-form',
  templateUrl: './form.component.html',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    NgIf,
    AsyncPipe,

    MatFormFieldModule,
    MatInputModule,

    SdkRatesModule,
    CheckoutFormsInputModule,
    CheckoutFormsCoreModule,
  ],
  providers: [
    {
      provide: ANALYTICS_FORM_SETTINGS,
      useValue: {
        formName: ANALYTICS_FORM_NAME,
      },
    },
    PeDestroyService,
  ],
})
export class InquiryFormComponent implements OnInit {
  private fb = inject(FormBuilder);
  private store = inject(Store);
  private customElementService = inject(CustomElementService);
  private submit$ = inject(PaymentSubmissionService);
  private destroy$ = inject(PeDestroyService);

  @SelectSnapshot(FlowState.flow) public flow: FlowInterface;

  @SelectSnapshot(FlowState.paymentMethod) public paymentMethod: PaymentMethodEnum;

  @Output() submitted = new EventEmitter<Partial<FormInterface>>();

  @ViewChild('submitButton', { static: true }) submitButtonRef: ElementRef<HTMLButtonElement>;

  private readonly extra = this.store.selectSnapshot(FlowState.flow).extra;
  private readonly form = this.store.selectSnapshot<FormInterface>(PaymentState.form);

  public formGroup = this.fb.group({
    bankId: this.fb.control<string>(this.form?.bankId, Validators.required),
    iban: this.fb.control<string>({
      disabled: this.extra?.iban,
      value: this.extra?.iban ?? this.form?.iban,
    }, [Validators.required, ibanValidator]),
  });

  public readonly transformedBanks$ = this.store.selectOnce(PaymentState.options).pipe(
    map((nodeFormOptions: FormOptionsInterface) => nodeFormOptions?.banks.map(bank => ({
      id: bank.id,
      title: bank.name,
      svgIconUrl: bank.logoUri,
    })))
  );

  public readonly ibanMask = ibanMaskFn;
  public readonly ibanUnmask = ibanUnmaskFn;

  get initialBank(): string {
    const paymentForm = this.store.selectSnapshot(PaymentState.form);

    return paymentForm?.bankId;
  }


  ngOnInit(): void {
    (window as any).PayeverStatic?.SvgIconsLoader?.loadIcons(
      ['arrow-left-16'],
      null,
      this.customElementService.shadowRoot
    );

    const submit$ = this.submit$.pipe(
      tap(() => {
        this.submitButtonRef.nativeElement.click();
      }),
    );

    const valueChanges$ = this.formGroup.valueChanges.pipe(
      auditTime(300),
      tap(values => this.store.dispatch(new PatchFormState(values))),

    );

    merge(
      submit$,
      valueChanges$
    ).pipe(
      takeUntil(this.destroy$)
    ).subscribe();
  }

  bankSelected(bank: string): void {
    this.formGroup.get('bankId').setValue(bank);
  }

  onSubmit(): void {
    const { valid } = this.formGroup;

    if (!valid) {
      return;
    }

    this.submitted.emit(this.formGroup.getRawValue());
  }
}
