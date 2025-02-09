import { AfterViewInit, ChangeDetectionStrategy, Component, Injector, Input, OnInit } from '@angular/core';
import { AbstractControl, FormGroup, ValidatorFn, Validators } from '@angular/forms';
import { filter, takeUntil } from 'rxjs/operators';

import {
  AddonStyle,
  AddonType,
  ErrorBag,
  FormAbstractComponent,
  FormScheme,
  SelectOptionInterface,
  SlideToggleLabelPosition,
} from '@pe/forms';
import { TranslateService } from '@pe/i18n';

import { SectionsService } from '../../../services';
import { MainSection } from '../../../../shared/interfaces/section.interface';
import { ProductEditorSections, ProductTypes } from '../../../../shared/enums/product.enum';
import { EnvService } from '../../../../shared/services/env.service';

const allProductTypes = [ProductTypes.Service, ProductTypes.Digital, ProductTypes.Physical];

const greaterThanValidator: ValidatorFn = (control: AbstractControl) => {
  const group = control.parent;
  if (group) {
    const price = group.get('price');

    const greaterThan = Number(control.value) > Number(price.value);
    return greaterThan ? { salePrice: false } : null;
  }
  return null;
};

const greaterPriceThanSalePriceValidator: ValidatorFn = (form: FormGroup) => {
  const price = form.get('price').value;
  const salePrice = form.get('salePrice').value;

  return price < salePrice ? { salePriceGreater: true } : null;
};

@Component({
  // tslint:disable-next-line:component-selector
  selector: 'main-section',
  templateUrl: 'editor-main-section.component.html',
  styleUrls: ['editor-main-section.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [ErrorBag],
})
export class EditorMainSectionComponent extends FormAbstractComponent<MainSection> implements OnInit, AfterViewInit {
  readonly section: ProductEditorSections = ProductEditorSections.Main;

  @Input() theme: string;

  productType: ProductTypes = ProductTypes.Physical;
  currency: string;
  mainSection: MainSection = this.sectionsService.mainSection;
  formScheme: FormScheme;
  formTranslationsScope = 'mainSection.form';
  blobs: string[] = [];

  private productTypes: SelectOptionInterface[] = [];

  protected formStorageKey = 'mainSection.form';

  constructor(
    injector: Injector,
    protected errorBag: ErrorBag,
    private envService: EnvService,
    private readonly translateService: TranslateService,
    private sectionsService: SectionsService,
  ) {
    super(injector);
    this.onToggleSale = this.onToggleSale.bind(this);
  }

  ngOnInit(): void {
    this.currency = this.envService.currency;

    this.sectionsService.saveClicked$.pipe(takeUntil(this.destroyed$)).subscribe(() => {
      this.doSubmit();
    });

    this.sectionsService.recurringBillingChange$
      .pipe(
        takeUntil(this.destroyed$),
        filter(d => !!d),
      )
      .subscribe(data => {
        this.toggleControl('onSales', !data.enabled);
      });

    this.productTypes = allProductTypes.map((type: ProductTypes) => {
      return {
        label: type[0].toUpperCase() + type.substr(1).toLowerCase(),
        value: type,
      };
    });
    this.productType = this.sectionsService.productType;
    this.sectionsService.productType$.next(this.productType);
  }

  onChangePictures(blobs: string[]): void {
    this.blobs = blobs;
    this.sectionsService.onChangeMainSection(Object.assign({}, this.form.getRawValue(), { images: this.blobs }));
  }

  onPicturesLoadingChanged(loading: boolean): void {
    this.sectionsService.isUpdating$.next(loading);
  }

  onToggleSale(event: any): void {
    this.form.controls.onSales.setValue(!this.form.controls.onSales.value);
    this.form.controls.onSales.updateValueAndValidity();
  }

  onAvailable(available: any): void {
    if (!this.form) {
      return;
    }

    if (available.checked) {
      this.form.controls.available.setValidators([Validators.required]);
    } else {
      this.form.controls.available.clearValidators();
    }
    this.form.controls.available.updateValueAndValidity();
  }

  onDescriptionChange(text: string): void {
    this.form.get('description').setValue(text);
  }

  get descriptionInvalid(): boolean {
    const control: AbstractControl = this.form.get('description');
    return this.isSubmitted && control.invalid;
  }

  protected createForm(initialData: MainSection): void {
    const data: MainSection = this.mainSection;
    data.price = data.price > 0 ? data.price : null;
    this.form = this.formBuilder.group({
      productType: [data.productType, Validators.required],
      title: [data.title, Validators.required],
      price: [data.price, [Validators.required, Validators.min(0)]],
      available: [data.available, Validators.required],
      salePrice: [data.salePrice, [Validators.min(0)]],
      onSales: [data.onSales],
    }, {validators: greaterPriceThanSalePriceValidator});

    this.formScheme = {
      fieldsets: {
        main: [
          {
            name: 'title',
            type: 'input',
            fieldSettings: {
              classList: 'col-xs-8 col-sm-8',
              required: true,
            },
            inputSettings: {
              placeholder: this.translateService.translate('name.placeholders.name_full'),
              autocompleteAttribute: 'off',
            },
          },
          {
            name: 'available',
            type: 'slide-toggle',
            fieldSettings: {
              classList: 'col-xs-4 col-sm-4',
              label: this.translateService.translate('price.available'),
            },
            slideToggleSettings: {
              fullWidth: true,
              withoutLeftPadding: true,
              labelPosition: SlideToggleLabelPosition.Before,
              // tslint:disable-next-line no-unbound-method
              onValueChange: this.onAvailable,
            },
          },
          {
            name: 'price',
            type: 'input-currency',
            fieldSettings: {
              classList: `col-xs-6`,
              required: true,
              label: this.translateService.translate('placeholders.price'),
            },
            addonAppend: {
              addonType: AddonType.Text,
              addonStyle: AddonStyle.Filled,
              text: this.currency || 'EUR',
            },
            inputCurrencySettings: {
              maxLength: 6,
              placeholder: this.translateService.translate('placeholders.price'),
            },
          },
          {
            name: 'salePrice',
            type: 'input-currency',
            fieldSettings: {
              classList: `col-xs-6`,
              required: data.onSales,
              label: this.translateService.translate('placeholders.salePrice'),
            },
            addonAppend: {
              addonType: AddonType.Text,
              addonStyle: AddonStyle.Filled,
              text: this.currency || 'EUR',
              toggleAddon: {
                addonType: AddonType.Toggle,
                toggleSettings: {
                  fullWidth: true,
                  labelPosition: SlideToggleLabelPosition.Before,
                  onClick: this.onToggleSale,
                },
              },
            },
            inputCurrencySettings: {
              maxLength: 6,
              placeholder: this.translateService.translate('placeholders.salePrice'),
            },
          },
          {
            name: 'productType',
            type: 'select',
            fieldSettings: {
              classList: `col-xs-12`,
              required: true,
              label: this.translateService.translate('placeholders.productType'),
            },
            selectSettings: {
              options: this.productTypes,
              panelClass: 'mat-select-dark',
            },
          },
        ],
      },
    };

    this.form
      .get('onSales')
      .valueChanges.pipe(takeUntil(this.destroyed$))
      .subscribe((change: boolean) => {
        const control = this.form.get('salePrice');
        if (change) {
          control.setValidators([Validators.required, greaterThanValidator]);
        } else {
          control.setValidators([]);
        }

        control.updateValueAndValidity();
      });

    this.changeDetectorRef.detectChanges();
  }

  protected onUpdateFormData(formValues: MainSection): void {
    this.sectionsService.onChangeMainSection(Object.assign({}, this.form.getRawValue(), { images: this.blobs }));
  }

  protected onSuccess(): void {
    this.sectionsService.onFindError(false, this.section);
  }

  protected onFormInvalid(): void {
    this.sectionsService.onFindError(true, this.section);
  }

  onPriceChange(value: number, formControlName: string): void {
    if (value < 0) {
      this.form.get(formControlName).patchValue(0);
    }
  }

}
