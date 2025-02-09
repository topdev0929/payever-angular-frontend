import { ChangeDetectionStrategy, Component, Injector, Input, OnInit } from '@angular/core';
import { FormGroup, ValidatorFn, Validators } from '@angular/forms';
import { Subject } from 'rxjs';
import { filter, takeUntil, tap } from 'rxjs/operators';

import { ErrorBag, FormAbstractComponent, FormScheme, PeValidators } from '@pe/forms';
import { TranslateService } from '@pe/i18n';

import { ProductEditorSections } from '../../../../shared/enums/product.enum';
import { ExternalError, InventorySection } from '../../../../shared/interfaces/section.interface';
import { SectionsService } from '../../../services';
import { LanguageService } from '../../../services/language.service';

const MAX_INVENTORY = 1000000000;

export const greaterStockThanLowStockValidator: ValidatorFn = (form: FormGroup) => {
  const stock = form.get('inventory').value;
  const lowStock = form.get('lowInventory').value;

  return stock < lowStock ? { lowInventoryGreater: true } : null;
};

@Component({
  selector: 'inventory-section',
  templateUrl: 'editor-inventory-section.component.html',
  styleUrls: ['editor-inventory-section.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [ErrorBag],
})
export class EditorInventorySectionComponent extends FormAbstractComponent<InventorySection> implements OnInit {
  @Input() externalError: Subject<ExternalError>;
  readonly section: ProductEditorSections = ProductEditorSections.Inventory;
  inventorySection: InventorySection = this.sectionsService.inventorySection;
  formScheme: FormScheme;
  formTranslationsScope = 'infoSection.form';

  protected formStorageKey = 'infoSection.form';

  constructor(
    injector: Injector,
    protected errorBag: ErrorBag,
    private readonly translateService: TranslateService,
    private sectionsService: SectionsService,
    private languageService: LanguageService,
  ) {
    super(injector);
  }

  ngOnInit(): void {
    this.sectionsService.saveClicked$
      .pipe(
        takeUntil(this.destroyed$),
        tap(() => {
          this.doSubmit();
        }),
        filter(section => section === ProductEditorSections.Inventory),
        filter(() => this.form.valid),
      )
      .subscribe();


    this.externalError
      .pipe(
        takeUntil(this.destroyed$),
        filter((item: any) => item.section === ProductEditorSections.Inventory),
        tap((item) => {
          const errors: any = {};
          errors[item.field] = item.errorText;
          this.errorBag.setErrors(errors);
          this.sectionsService.onFindError(true, this.section);
          this.form.get('sku').setErrors({ exist: true });
          this.form.updateValueAndValidity();
          this.changeDetectorRef.detectChanges();
        }),
      )
      .subscribe();
  }

  protected createForm(initialData: InventorySection): void {
    const data: InventorySection = this.inventorySection;

    this.form = this.formBuilder.group({
      sku: [
        data.sku,
        [
          PeValidators.validSKU(),
          Validators.required,
        ],
        this.sectionsService.isSkuUniqAsync(this.sectionsService.inventorySection.sku),
      ],
      barcode: [data.barcode],
      inventory: [data.inventory, [Validators.min(0), Validators.max(MAX_INVENTORY)]],
      lowInventory: [data.lowInventory, [Validators.min(0), Validators.max(MAX_INVENTORY)]],
      emailLowStock: [data.emailLowStock],
      inventoryTrackingEnabled: [data.inventoryTrackingEnabled],
    },{ validators: greaterStockThanLowStockValidator });


    this.languageService.language$.pipe(
      tap(() => {
        this.onUpdateFormData();
        this.form.get('sku').clearAsyncValidators();
        this.form.get('sku').setAsyncValidators(
          this.sectionsService.isSkuUniqAsync(this.sectionsService.inventorySection.sku)
        );
      }),
      takeUntil(this.destroyed$)
    ).subscribe();

    this.changeDetectorRef.detectChanges();
  }

  protected onUpdateFormData(): void {
    this.sectionsService.onChangeInventorySection(this.form.getRawValue());
  }

  protected onSuccess(): void {
    this.sectionsService.onFindError(false, this.section);
  }

  protected onFormInvalid(): void {
    this.sectionsService.onFindError(true, this.section);
  }

  get skuError() {
    const externalErr = this.errorBag.getError('sku');
    if (this.form.controls?.sku?.errors?.exist) {
      return externalErr;
    } else if (this.form.controls?.sku?.errors?.SKU === '') {
      return this.translateService.translate('variantEditor.errors.wrong_sku');
    } else if (this.form.get('sku').hasError('required')) {
      return this.translateService.translate('variantEditor.errors.sku_is_required');
    } else if (this.form.get('sku').hasError('external')) {
      return this.form.controls.sku.errors.external;
    }

    return '';
  }

  get inventoryInvalid() {
    return (this.isSubmitted && this.form.controls.inventory.invalid) || this.form.controls.inventory.errors?.max;
  }

  get inventoryErrorMessage() {
    if (this.form.controls.inventory.errors?.min) {
      return this.translateService.translate('inventorySection.errors.min_inventory');
    }
    if (this.form.controls.inventory.errors?.max) {
      const field = this.translateService.translate('info.placeholders.inventory');
      return this.translateService.translate('errors.max_number', { field })
    }

    return null;
  }

  get lowInventoryInvalid(): boolean {
    if (this.form.controls.lowInventory.errors?.max) {
      return true;
    }
    if (!this.isSubmitted) {
      return false;
    }
    if (this.form.errors?.lowInventoryGreater &&
      !this.form.controls.inventory.errors?.min ||
      this.form.controls.lowInventory.invalid
    ) {
      return true;
    }

    return false;
  }

  get lowInventoryErrorMessage() {
    if (this.form.controls.lowInventory.errors?.min) {
      return this.translateService.translate('inventorySection.errors.min_inventory');
    }
    if (this.form.controls.lowInventory.errors?.max) {
      const field = this.translateService.translate('info.placeholders.low_inventory');
      return this.translateService.translate('errors.max_number', { field })
    }
    if (this.form.errors?.lowInventoryGreater && !this.form.controls.inventory.errors?.min) {
      return this.translateService.translate('inventorySection.errors.low_inventory_greater');
    }

    return null;
  }
}
