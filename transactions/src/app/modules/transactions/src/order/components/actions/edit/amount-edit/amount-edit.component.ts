import { Component, ChangeDetectionStrategy, EventEmitter, Input, Injector, OnInit, Output } from '@angular/core';
import { Validators } from '@angular/forms';
import { Observable } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import { CurrencySymbolPipe, TranslateService } from '@pe/ng-kit/modules/i18n';
import { AddonType, AddonInterface, FormFieldType } from '@pe/ng-kit/modules/form';
import { FormAbstractComponent, FormScheme, ErrorBag, FormSchemeField } from '@pe/ng-kit/modules/form';
import { ApiService } from '@pe/checkout-sdk/sdk/api';

import {
  ResponseErrorsInterface,
  FlowInterface
} from '@pe/checkout-sdk/sdk/types';

interface AmountFormInterface {
  amount?: number;
}

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'checkout-amount-edit',
  styleUrls: ['./amount-edit.component.scss'],
  templateUrl: 'amount-edit.component.html',
  providers: [ ErrorBag ]
})
export class AmountEditComponent extends FormAbstractComponent<AmountFormInterface> implements OnInit {

  formScheme: FormScheme;
  fieldset: FormSchemeField[];

  isLoading: boolean = false;

  @Input() flow: FlowInterface;
  @Output() saved: EventEmitter<FlowInterface> = new EventEmitter<FlowInterface>();
  @Output('isLoading') isSaving: EventEmitter<boolean> = new EventEmitter<boolean>();

  get formStorageKey(): string {
    return `transactions_amount_edit.pos-de.form.${this.flow.id}`;
  }

  constructor(
    injector: Injector,
    protected errorBag: ErrorBag,
    private apiService: ApiService,
    private currencySymbolPipe: CurrencySymbolPipe,
    private translateService: TranslateService
  ) {
    super(injector);
  }

  ngOnInit(): void {
  }

  onSuccess(): void {
    this.isLoading = true;
    this.isSaving.emit(true);
    this.changeDetectorRef.detectChanges();
    this.saveData(this.form.value).pipe(takeUntil(this.destroyed$)).subscribe(
      (flow: FlowInterface) => {
        if (flow) {
          this.onSaveSuccess(flow);
        }
        this.isLoading = false;
        this.isSaving.emit(false);
      },
      (error: ResponseErrorsInterface) => {
        this.isLoading = false;
        this.isSaving.emit(false);
        this.handleErrors(error);
      }
    );
  }

  protected onUpdateFormData(formValues: any): void {
  }

  protected createForm(initialData: AmountFormInterface): void {
    const flow: FlowInterface = this.flow;

    this.form = this.formBuilder.group({
      amount: [flow.amount || initialData.amount, Validators.required]
    });

    this.formScheme = {
      fieldsets: {
        first: [
          {
            name: 'amount',
            type: FormFieldType.InputCurrency,
            fieldSettings: {
              classList: 'col-xs-12',
              fullStoryHide: true,
              required: true
            },
            inputCurrencySettings: {
              maxLength: 9
            },
            addonPrepend: this.getCurrencyAddon(this.flow.currency)
          }
        ]
      }
    };
    this.fieldset = this.formScheme.fieldsets['first'];
    this.changeDetectorRef.detectChanges();
  }

  private handleErrors(data: ResponseErrorsInterface): void {
    if (data.errors) {
      this.errorBag.setErrors(data.errors);
    } else {
      console.warn(data);
      this.errorBag.setErrors({
        email: data.message
      });
    }
    this.isLoading = false;
    this.changeDetectorRef.detectChanges();
  }

  private onSaveSuccess(data: FlowInterface): void {
    this.flushDataStorage();
    this.saved.next(data);
  }

  private saveData(data: AmountFormInterface): Observable<FlowInterface> {
    return this.apiService._patchFlow(this.flow.id, data);
  }

  private getCurrencyAddon(currencyCode: string): AddonInterface {
    return {
      addonType: AddonType.Text,
      text: `<span class="regular-2">${this.currencySymbolPipe.transform(currencyCode)}</span>`
    };
  }
}
