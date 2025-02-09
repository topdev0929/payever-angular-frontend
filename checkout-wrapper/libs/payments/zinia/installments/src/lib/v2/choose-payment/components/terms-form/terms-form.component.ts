import { ChangeDetectionStrategy, Component, Input, OnInit, inject } from '@angular/core';
import { FormGroup, Validators } from '@angular/forms';
import { Store } from '@ngxs/store';
import { startWith, takeUntil, tap } from 'rxjs/operators';

import { AnalyticConsentEventEnum } from '@pe/checkout/analytics';
import { CompositeForm } from '@pe/checkout/forms';
import { PaymentState } from '@pe/checkout/store';

import { FormValue, TermsDTO, TermsFormValue, ZiniaViewTerm } from '../../../shared';

@Component({
  selector: 'terms-form',
  templateUrl: './terms-form.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TermsFormComponent extends CompositeForm<Partial<TermsFormValue>> implements OnInit {

  private readonly store = inject(Store);

  @Input() terms: TermsDTO;

  public readonly analyticConsentEventEnum = AnalyticConsentEventEnum;

  public formGroup = this.fb.group({});

  public readonly hiddenTerms: {
    [key: string]: boolean;
  } = {
    terms: true,
    consents: true,
  };

  get customerControls() {
    return this.formGroup.controls;
  }

  termFromArrayControls(formArray: any): FormGroup[] {
    return formArray.controls as FormGroup[];
  }

  override ngOnInit(): void {
    this.createTermsForm(this.terms);
    super.ngOnInit();
  }

  override registerOnChange(fn: (value: Partial<TermsFormValue>) => void): void {
    this.formGroup.valueChanges.pipe(
      startWith(this.formGroup.value),
      tap((value) => {
        this.onTouch?.();
        fn(value);
      }),
      takeUntil(this.destroy$),
    ).subscribe();
  }

  private createTermsForm(terms: TermsDTO): void {
    if (!terms) {
      return;
    }

    const formData: FormValue = this.store.selectSnapshot(PaymentState.form);

    Object.entries(terms).forEach(([key, value]) => {
      const formArray = this.fb.array(
        value.map((item: ZiniaViewTerm, index: number) => this.fb.group({
          value: this.fb.control(
            formData?.termsForm?.[key]?.[index]?.value
              ?? this.hiddenTerms[key]
              ?? false,
            item.required ? [Validators.requiredTrue] : [],
          ),
          documentId: [item.documentId],
          merchantText: this.terms[key][index].label,
        })),
      );

      (this.formGroup as FormGroup).setControl(key, formArray);
    });
  }
}
