import { ChangeDetectionStrategy, Component, Injector, OnInit } from '@angular/core';
import { Validators } from '@angular/forms';
import { Observable } from 'rxjs';
import { filter, map, skip, takeUntil, tap } from 'rxjs/operators';

import {
  ErrorBag,
  FormAbstractComponent,
  FormScheme,
} from '@pe/forms';
import { TranslateService } from '@pe/i18n';

import { ProductEditorSections, ProductTypes } from '../../../../shared/enums/product.enum';
import { ShippingSection } from '../../../../shared/interfaces/section.interface';
import { SectionsService } from '../../../services';
import { CountryService } from '../../../services/country.service';

const SHIPPING_TRANSLATION = {
  label: {
    widthSize: 'shippingSection.form.width.label',
    lengthSize: 'shippingSection.form.length.label',
    heightSize: 'shippingSection.form.height.label',
    weightSize: 'shippingSection.form.weight.label',
  },
  required: {
    widthSize: 'shippingSection.errors.width_is_required',
    lengthSize: 'shippingSection.errors.length_is_required',
    heightSize: 'shippingSection.errors.height_is_required',
    weightSize: 'shippingSection.errors.weight_is_required',
  },
  min: {
    widthSize: 'shippingSection.form.width.min_validation',
    lengthSize: 'shippingSection.form.length.min_validation',
    heightSize: 'shippingSection.form.height.min_validation',
    weightSize: 'shippingSection.form.weight.min_validation',
  },
}

const MAX_VALUE = 9_999_999_999_999;

@Component({
  selector: 'shipping-section',
  templateUrl: 'editor-shipping-section.component.html',
  styleUrls: ['editor-shipping-section.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [ErrorBag],
})

export class EditorShippingSectionComponent extends FormAbstractComponent<ShippingSection> implements OnInit {
  readonly section: ProductEditorSections = ProductEditorSections.Shipping;
  formScheme: FormScheme;
  formTranslationsScope = 'shippingSection.form';

  protected formStorageKey = 'shippingSection.form';

  constructor(
    injector: Injector,
    protected errorBag: ErrorBag,
    private readonly translateService: TranslateService,
    private sectionsService: SectionsService,
    private countryService: CountryService,
  ) {
    super(injector);
  }

  get isPhysicalProduct$(): Observable<boolean> {
    return this.sectionsService.productType$.asObservable().pipe(
      map((item: ProductTypes) => item === ProductTypes.Physical),
    );
  }

  ngOnInit(): void {
    this.sectionsService.saveClicked$.pipe(takeUntil(this.destroyed$)).subscribe(() => {
      if (this.sectionsService.productType === ProductTypes.Physical) {
        this.doSubmit();
      }
    });

    this.sectionsService.saveClickedSuccess$.pipe(takeUntil(this.destroyed$)).subscribe(() => {
      if (this.sectionsService.productType !== ProductTypes.Physical) {
        this.sectionsService.onChangeShippingSection(null);
      }
    });

    this.isPhysicalProduct$.pipe(filter(Boolean), skip(1), takeUntil(this.destroyed$)).subscribe(() => {
      // this.createForm(this.initialData); remove if all is good
    });
  }

  getMessage(type: keyof ShippingSection): string {
    const controls = this.form.controls;

    if (!this.isSubmitted && !controls[type].errors?.max) {
      return null;
    }

    if (controls[type].errors?.required) {
      return this.translateService.translate(SHIPPING_TRANSLATION.required[type]);
    }
    if (controls[type].errors?.min) {
      return this.translateService.translate(SHIPPING_TRANSLATION.min[type]);
    }
    if (controls[type].errors?.max) {
      const field = this.translateService.translate(SHIPPING_TRANSLATION.label[type]);
      return this.translateService.translate('errors.max_number', { field })
    }
  }

  protected createForm(initialData: ShippingSection): void {
    const data =  this.sectionsService.shippingSection;

    this.form = this.formBuilder.group({
      weightSize: [data.weight, [Validators.required, Validators.min(0), Validators.max(MAX_VALUE)]],
      widthSize: [data.width, [Validators.required, Validators.min(0), Validators.max(MAX_VALUE)]],
      lengthSize: [data.length, [Validators.required, Validators.min(0), Validators.max(MAX_VALUE)]],
      heightSize: [data.height, [Validators.required, Validators.min(0), Validators.max(MAX_VALUE)]],
    });

    this.changeDetectorRef.detectChanges();

    this.countryService.updatedCountry$.pipe(
      tap((product) => {
        this.form.setValue(product.shipping);
      }),
      takeUntil(this.destroyed$)
    ).subscribe();
  }

  protected onUpdateFormData(formValues: ShippingSection): void {
    this.sectionsService.onChangeShippingSection(this.form.getRawValue());
  }

  protected onSuccess(): void {
    this.sectionsService.onFindError(false, this.section);
  }

  protected onFormInvalid(): void {
    this.sectionsService.onFindError(true, this.section);
  }
}
