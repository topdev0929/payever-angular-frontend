import {
  ChangeDetectionStrategy,
  Component,
  Input,
  OnInit,
  Output,
} from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { SelectSnapshot } from '@ngxs-labs/select-snapshot';
import { Store } from '@ngxs/store';
import { filter, map } from 'rxjs/operators';

import { AnalyticsFormService } from '@pe/checkout/analytics';
import { PaymentSubmissionService } from '@pe/checkout/payment';
import { FlowState, SetLockedUi } from '@pe/checkout/store';
import { PaymentMethodEnum } from '@pe/checkout/types';
import { CustomElementService } from '@pe/checkout/utils';

import { FormInterface, PaymentDataInterface } from '../../../shared/types';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'santander-de-fact-inquiry-form',
  templateUrl: './inquiry-form.component.html',
  styleUrls: ['./inquiry-form.component.scss'],
})
export class InquiryFormComponent implements OnInit {

  @SelectSnapshot(FlowState.paymentMethod) public paymentMethod!: PaymentMethodEnum;

  @Input() set paymentData(value: PaymentDataInterface) {
    this.formGroup.patchValue(value);
    this.submit$.next();
  }

  @Output() submitted = this.submit$.pipe(
    filter(() => this.formGroup.valid),
    map(() => this.formGroup.value as FormInterface),
  );

  public formGroup = this.fb.group({
    contractPdfUrl: this.fb.control<string>(null),
    initializeUniqueId: this.fb.control<string>(null, Validators.required),
    annualPercentageRate: this.fb.control<number>(null, Validators.required),
  });

  constructor(
    protected customElementService: CustomElementService,
    private store: Store,
    private fb: FormBuilder,
    private submit$: PaymentSubmissionService,
    private analyticsFormService: AnalyticsFormService,
  ) {}

  ngOnInit(): void {
    (window as any).PayeverStatic?.SvgIconsLoader?.loadIcons(
      ['xls-24'],
      null,
      this.customElementService.shadowRoot
    );
    this.store.dispatch(new SetLockedUi(true));
  }
}
