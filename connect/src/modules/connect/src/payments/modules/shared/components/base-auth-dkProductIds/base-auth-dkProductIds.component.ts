import { Injector, Directive } from '@angular/core';
import { Validators} from '@angular/forms';
import { BehaviorSubject, timer } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { cloneDeep, isEqual } from 'lodash-es';

import { MatCheckboxChange } from '@angular/material/checkbox';

import {
  AddonType,
  InputType,
  FormScheme
} from '@pe/forms';

import { SantanderDkStoreProductDataInterface as ProductDataInterface } from '../../../../../shared';
import { BaseAuthComponent } from '../../../shared/components/base-auth/base-auth.component';

interface FormInterface {
  credentials: {
    storeId: string;
  };
}

@Directive()
export abstract class SantanderDkCredentialsStoreProductData extends BaseAuthComponent<FormInterface> {

  formScheme: FormScheme = {
    fieldsets: {
      credentials: [
        {
          name: 'storeId',
          type: 'input',
          ...this.makeFieldInputSettings$({
            classList: 'col-xs-12 no-border-radius form-fieldset-field-padding-24',
            required: true
          }, {
            type: InputType.Text
          }),
          addonAppend: {
            addonType: AddonType.Button,
            noDefaultClass: true,
            className: 'mat-raised-button mat-muted-light mat-button-rounded mat-button-xs',
            text: this.translateService.translate('categories.payments.actions.get_products'),
            onClick: () => {
              this.getProducts();
            }
          }
        }
      ]
    }
  };

  startProductIds: string[] = [];
  startStoreId: string;
  lastRequestStoreId: string;

  productIds: string[] = [];
  isEmailNotificationAllowed: boolean;
  products$: BehaviorSubject<ProductDataInterface[]> = new BehaviorSubject<ProductDataInterface[]>(null);

  constructor(injector: Injector) {
    super(injector);
  }

  createFormDeferred(initialData: FormInterface) {
    const credentials = this.payment.variants[this.paymentIndex].credentials || {};
    this.form = this.formBuilder.group({
      credentials: this.formBuilder.group({
        storeId: [credentials.storeId, Validators.required],
      })
    });

    this.afterCreateFormDeferred();

    this.startStoreId = this.getStoreId();
    this.productIds = (credentials.productIds as any || []).map(id => String(id));
    this.startProductIds = this.productIds;
    this.isEmailNotificationAllowed = Boolean(credentials.isEmailNotificationAllowed);

    if (this.getStoreId()) {
      this.getProducts();
    }
  }

  isStartValueChanged(): boolean {
    return this.getStoreId() && (this.startStoreId !== this.getStoreId() || !isEqual(this.productIds.sort(), this.startProductIds.sort()));
  }

  onSuccess() {
    if (this.isNeedGetProducts()) {
      this.getProducts();
    } else {
      if (this.productIds.length) {
        this.isLoading$.next(true);
        this.paymentsStateService.saveCredentials({
          credentials: {
            storeId: this.getStoreId(),
            productIds: this.productIds,
            isEmailNotificationAllowed: this.isEmailNotificationAllowed
          }
        }, this.payment, this.payment.variants[this.paymentIndex]).pipe(takeUntil(this.destroyed$)).subscribe(data => {
          this.startValue = cloneDeep(this.form.value);
          this.startProductIds = this.productIds;
          this.changeDetectorRef.detectChanges();
          this.isLoading$.next(false);
        }, error => {
          this.isLoading$.next(false);
          this.handleError(error, true);
        });
      } else {
        this.showStepError(this.translateService.translate('categories.payments.auth.dk_products.errors.no_one_product_selected'));
      }
    }
  }

  getStoreId(): string {
    return this.form.get('credentials').get('storeId').value;
  }

  getProducts(): void {
    if (!this.isLoading$.getValue()) {
      if (this.getStoreId()) {
        this.isLoading$.next(true);
        this.paymentsStateService.getSantanderDkCredentialsStoreProductData(this.payment.variants[this.paymentIndex], this.getStoreId()).pipe(takeUntil(this.destroyed$)).subscribe(productData => {
          this.products$.next(productData);
          this.filterSelectedProducts();
          this.lastRequestStoreId = this.getStoreId();
          this.isLoading$.next(false);
        }, err => {
          console.error('Cant get product data', err);
          this.showStepError(this.translateService.translate('categories.payments.auth.dk_products.errors.cant_get_store_products'));
          this.products$.next(null);
          this.isLoading$.next(false);
        });
      } else {
        this.showStepError(this.translateService.translate('categories.payments.auth.dk_products.errors.empty_store_id'));
      }
    }
  }

  onProductChecked(event: MatCheckboxChange, productId: string): void {
    this.productIds = this.productIds.filter(id => id !== String(productId));
    if (event.checked) {
      this.productIds.push(String(productId));
    }
  }

  isProductChecked(productId: string): boolean {
    return this.productIds.indexOf(String(productId)) >= 0;
  }

  isNeedGetProducts(): boolean {
    return !this.products$.getValue() || this.lastRequestStoreId !== this.getStoreId();
  }

  protected onClearCredentials(): void {
    super.onClearCredentials();
    this.products$.next(null);
  }

  private filterSelectedProducts(): void {
    const existingIds = this.products$.getValue().map(info => String(info.Id));
    this.productIds = this.productIds.filter(productId => existingIds.indexOf(productId) >= 0);
  }
}
