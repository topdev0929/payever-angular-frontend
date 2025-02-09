import { ChangeDetectionStrategy, Component, Injector, Input, OnInit, ViewEncapsulation } from '@angular/core';
import { Validators } from '@angular/forms';
import { Subject } from 'rxjs';
import { filter, takeUntil, tap } from 'rxjs/operators';

import { ErrorBag, FormAbstractComponent, FormScheme, InputType, PeValidators } from '@pe/forms';
import { TranslateService } from '@pe/i18n';

import { SectionsService } from '../../../services';
import { ExternalError, InventorySection } from '../../../../shared/interfaces/section.interface';
import { ProductEditorSections } from '../../../../shared/enums/product.enum';

const MAX_INVENTORY = 1000000000;

@Component({
  // tslint:disable-next-line:component-selector
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
  ) {
    super(injector);
  }

  ngOnInit(): void {
    this.sectionsService.saveClicked$
      .pipe(
        takeUntil(this.destroyed$),
        tap(() => this.doSubmit()),
        filter(section => section === ProductEditorSections.Inventory),
        filter(() => this.form.valid),
      )
      .subscribe(() => this.doSubmit());

    this.sectionsService.variantsChange$.pipe(takeUntil(this.destroyed$)).subscribe(() => {
      this.toggleControls();
    });

    this.externalError
      .pipe(
        takeUntil(this.destroyed$),
        filter((item: any) => item.section === ProductEditorSections.Inventory),
        tap((item) => {
          const errors: any = {};
          errors[item.field] = item.errorText;
          this.errorBag.setErrors(errors);
          this.sectionsService.onFindError(true, this.section);
          this.form.get('sku').setErrors({exist: true});
          this.form.updateValueAndValidity();
          this.changeDetectorRef.detectChanges();
        }),
      )
      .subscribe();
  }

  protected createForm(initialData: InventorySection): void {
    const data: InventorySection = this.inventorySection;

    this.form = this.formBuilder.group({
      sku: [data.sku, [PeValidators.validSKU(), Validators.required]],
      barcode: [data.barcode],
      inventory: [data.inventory, [Validators.min(0), Validators.max(MAX_INVENTORY)]],
      inventoryTrackingEnabled: [data.inventoryTrackingEnabled],
    });

    this.formScheme = {
      fieldsets: {
        inventory: [
          {
            name: 'sku',
            type: 'input',
            fieldSettings: {
              classList: 'col-xs-6 col-sm-6',
              required: true,
              label: this.translateService.translate('price.placeholders.skucode'),
            },
            inputSettings: {
              placeholder: this.translateService.translate('price.placeholders.skucode'),
              autocompleteAttribute: 'off',
            },
          },
          {
            name: 'barcode',
            type: 'input',
            fieldSettings: {
              classList: 'col-xs-6 col-sm-6',
              required: false,
            },
            inputSettings: {
              placeholder: this.translateService.translate('price.placeholders.barcode'),
              autocompleteAttribute: 'off',
            },
          },
          {
            name: 'inventoryTrackingEnabled',
            type: 'slide-toggle',
            fieldSettings: {
              classList: `col-xs-8 label-white`,
              label: this.translateService.translate('info.placeholders.inventoryTrackingEnabled'),
            },
            inputSettings: {
              placeholder: this.translateService.translate('info.placeholders.inventoryTrackingEnabled'),
            },
          },
          {
            name: 'inventory',
            type: 'input-spinner',
            fieldSettings: {
              classList: 'col-xs-4 no-user-select',
              label: this.translateService.translate('info.placeholders.inventory'),
            },
            inputSettings: {
              type: InputType.Number,
              placeholder: this.translateService.translate('info.placeholders.inventory'),
            },
          },
        ],
      },
    };

    this.toggleControls();

    this.changeDetectorRef.detectChanges();
  }

  protected onUpdateFormData(formValues: InventorySection): void {
    this.sectionsService.onChangeInventorySection(this.form.getRawValue());
  }

  protected onSuccess(): void {
    this.sectionsService.onFindError(false, this.section);
  }

  protected onFormInvalid(): void {
    this.sectionsService.onFindError(true, this.section);
  }

  private toggleControls(): void {
    if (this.sectionsService.variantsSection && this.sectionsService.variantsSection.length) {
      this.disableControl('inventoryTrackingEnabled');
      this.disableControl('inventory');
      this.disableControl('sku');
      this.sectionsService.onFindError(false, this.section);
      this.sectionsService.onChangeInventorySection({
        ...this.form.getRawValue(),
        inventoryTrackingEnabled: false,
        inventory: 0,
        sku: null,
      });
    } else {
      this.enableControl('inventoryTrackingEnabled');
      this.enableControl('inventory');
      this.enableControl('sku');
    }

    this.changeDetectorRef.detectChanges();
  }

  get skuError() {
    const externalErr = this.errorBag.getError('sku');
    if (this.form.controls?.sku?.errors?.exist) {
      return externalErr;
    } else if (this.form.controls?.sku?.errors?.SKU === '') {
      return this.translateService.translate('variantEditor.errors.wrong_sku');
    } else if (this.form.get('sku').hasError('required')) {
      return this.translateService.translate('variantEditor.errors.sku_is_required');
    }
    return '';
  }

  onSKUChange(event: Event) {
    this.form.get('sku').valueChanges.subscribe( () => {
      this.form.get('sku').setErrors({exist: false});
    });
  }
}
