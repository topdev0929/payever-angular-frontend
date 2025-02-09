
import { CurrencyPipe } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  Input,
  OnInit,
  Output,
  ViewChild,
} from '@angular/core';
import { FormBuilder, FormGroupDirective, Validators } from '@angular/forms';
import { SelectSnapshot } from '@ngxs-labs/select-snapshot';
import { Store } from '@ngxs/store';
import { defer } from 'rxjs';
import { filter, map, startWith, switchMap, take, takeUntil, tap } from 'rxjs/operators';

import { PaymentSubmissionService } from '@pe/checkout/payment';
import { FlowState, PatchFormState, PaymentState } from '@pe/checkout/store';
import { FlowInterface, PaymentMethodEnum, SalesScoringType } from '@pe/checkout/types';
import { PeDestroyService } from '@pe/destroy';

import { UtilStepService } from '../../../services';
import {
  FormInterface,
  RateInterface,
  SelectedInterface,
  SsnFormValue,
  TermsFormValue,
} from '../../../shared';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'santander-se-rates-form',
  templateUrl: './form.component.html',
  providers: [CurrencyPipe, PeDestroyService],
})
export class FormComponent implements OnInit {

  @SelectSnapshot(FlowState.flow) public flow: FlowInterface;

  @SelectSnapshot(FlowState.paymentMethod) public paymentMethod: PaymentMethodEnum;

  @ViewChild(FormGroupDirective) private formGroupDirective: FormGroupDirective;

  @Input() extraDuration: number;

  @Output() selectRate = new EventEmitter<RateInterface>();

  @Output() ratesLoadingError = new EventEmitter<any>();

  @Output() submitted = this.submit$.pipe(
    tap(() => {
      this.formGroupDirective.onSubmit(null);
    }),
    filter(() => this.formGroup.valid),
    map(() => this.formGroup.value as FormInterface),
  );

  public formGroup = this.fb.group({
    _authorizedForm: this.fb.group({
      employmentType: this.fb.control<string>(null),
      citizenship: this.fb.control<string>(null),
    }),
    ratesForm: this.fb.group({
      campaignCode: this.fb.control<string>(null, Validators.required),
      inquiryId: this.fb.control<string>(null),
      salesScoringType: this.fb.control<SalesScoringType>(null),
    }),
    ssnForm: this.fb.control<SsnFormValue>(null, Validators.required),
    termsForm: this.fb.control<TermsFormValue>(null, Validators.required),
  });

  public campaignCode$ = defer(() => this.formGroup.get('ratesForm.campaignCode').valueChanges.pipe(
    startWith(this.formGroup.get('ratesForm.campaignCode').value),
  ));

  private options$ = this.store.select(PaymentState.options);

  constructor(
    private store: Store,
    private fb: FormBuilder,
    private submit$: PaymentSubmissionService,
    private destroy$: PeDestroyService,
    private utilStepService: UtilStepService
  ) {}

  ngOnInit(): void {
    const formData: FormInterface = this.store.selectSnapshot(PaymentState.form);
    this.formGroup.patchValue(formData);

    this.formGroup.valueChanges.pipe(
      tap((value) => {
        this.store.dispatch(new PatchFormState(value));
      }),
      takeUntil(this.destroy$),
    ).subscribe();
  }

  public setInquiryId(inquiryId: string): void {
    inquiryId && this.formGroup.get('ratesForm.inquiryId').setValue(inquiryId);
  }

  public setSalesScoringType(salesScoringType: SalesScoringType): void {
    salesScoringType && this.formGroup.get('ratesForm.salesScoringType').setValue(salesScoringType);
    this.setAuthorizedForm(salesScoringType);
  }

  public onRateSelected(selected: SelectedInterface): void {
    this.formGroup.get('ratesForm.campaignCode').patchValue(selected.data.campaignCode);
    this.selectRate.next(selected.rate);
  }

  public setAuthorizedForm(salesScoringType: SalesScoringType): void {
    if (salesScoringType === SalesScoringType.Authorization) {
      this.options$.pipe(
        take(1),
        switchMap(options => this.utilStepService.getCountries(false, options).pipe(
          tap((countries) => {
            this.formGroup.get('_authorizedForm').patchValue({
              employmentType: options.employmentType[0]?.value?.toString() || '',
              citizenship: countries[0]?.value || '',
            });
          })
        )),
      ).subscribe();
    } else {
      this.formGroup.get('_authorizedForm').disable({
        emitEvent: false,
      });
    }
  }
}
