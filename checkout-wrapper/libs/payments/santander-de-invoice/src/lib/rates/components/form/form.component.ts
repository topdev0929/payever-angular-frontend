import {
  ChangeDetectionStrategy,
  Component,
  Input,
  OnInit,
  Output,
  ViewChild,
} from '@angular/core';
import { FormBuilder, FormGroupDirective, Validators } from '@angular/forms';
import { SelectSnapshot } from '@ngxs-labs/select-snapshot';
import { Store } from '@ngxs/store';
import { filter, map } from 'rxjs/operators';

import { AnalyticsFormService } from '@pe/checkout/analytics';
import { PaymentSubmissionService } from '@pe/checkout/payment';
import { FlowState, PaymentState } from '@pe/checkout/store';
import { FlowInterface, PaymentMethodEnum } from '@pe/checkout/types';
import { CustomElementService } from '@pe/checkout/utils';

import { FormInterface } from '../../../shared/types';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'santander-invoice-de-rates-form',
  templateUrl: './form.component.html',
  styleUrls: ['./form.component.scss'],
})
export class FormComponent implements OnInit {

  @SelectSnapshot(FlowState.flow) private flow: FlowInterface;

  @SelectSnapshot(FlowState.paymentMethod) private paymentMethod: PaymentMethodEnum;

  @ViewChild(FormGroupDirective) private formGroupDirective: FormGroupDirective;

  @Input() isPos: boolean;

  @Input() merchantMode: boolean;

  @Output() submitted = this.submit$.pipe(
    map(() => {
      const { valid, value } = this.formGroup;
      this.formGroupDirective.onSubmit(null);

      return { valid, value };
    }),
    filter(({ valid }) => valid),
    map(({ value }) => value as FormInterface),
  );

  public formGroup = this.fb.group({
    personalForm: [null, Validators.required],
    termsForm: [null, Validators.required],
  });

  protected allowScrollToError = false;

  translations = {
    promo: {
      text1: $localize `:@@santander-de-invoice.promo.text1:`,
      text2: $localize `:@@santander-de-invoice.promo.text2:`,
      text3: $localize `:@@santander-de-invoice.promo.text3:`,
    },
    pos: {
      promo: {
        text1: $localize `:@@santander-de-invoice-pos.promo.text1:`,
        text3: $localize `:@@santander-de-invoice-pos.promo.text3:`,
      },
    },
  };

  constructor(
    protected customElementService: CustomElementService,
    private store: Store,
    private fb: FormBuilder,
    private analyticsFormService: AnalyticsFormService,
    private submit$: PaymentSubmissionService,
  ) {}

  ngOnInit() {
    (window as any).PayeverStatic?.SvgIconsLoader?.loadIcons([
      'payment-after-delivery-32',
      'payment-keep-32',
      'payment-pause-32',
      'calendar-16',
    ], null, this.customElementService.shadowRoot);

    const formData = {
      personalForm: {
        phone: this.flow.billingAddress?.phone,
        salutation: this.flow.billingAddress?.salutation,
        _firstName: this.flow.billingAddress?.firstName,
        _lastName: this.flow.billingAddress?.lastName,
      },
      ...this.store.selectSnapshot(PaymentState.form),
    };

    formData && this.formGroup.patchValue(formData);
  }
}
