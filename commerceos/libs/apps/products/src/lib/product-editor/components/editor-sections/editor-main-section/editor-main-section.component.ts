import { formatDate } from '@angular/common';
import {
  AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  Injector,
  OnInit,
} from '@angular/core';
import { AbstractControl, FormGroup, ValidatorFn, Validators } from '@angular/forms';
import { MatIconRegistry } from "@angular/material/icon";
import { DomSanitizer } from "@angular/platform-browser";
import moment from 'moment/moment';
import { merge } from 'rxjs';
import { filter, takeUntil, tap } from 'rxjs/operators';

import {
  ErrorBag,
  FormAbstractComponent,
  FormScheme,
  SelectOptionInterface,
} from '@pe/forms';
import { TranslateService } from '@pe/i18n';
import { LocaleService } from '@pe/i18n-core';
import { PeDateTimePickerService } from '@pe/ui';

import { ProductConditions, ProductEditorSections, ProductTypes } from '../../../../shared/enums/product.enum';
import { ProductModel } from '../../../../shared/interfaces/product.interface';
import { MainSection } from '../../../../shared/interfaces/section.interface';
import { CurrencyService } from '../../../../shared/services/currency.service';
import { SectionsService } from '../../../services';
import { CountryService } from '../../../services/country.service';
import { LanguageService } from '../../../services/language.service';
import { dateMask } from '../../../utils';

const MAX_VALUE = 9_999_999_999_999;

const greaterThanValidator: ValidatorFn = (control: AbstractControl) => {
  const group = control.parent;
  if (group) {
    const price = group.get('price');

    const greaterThan = Number(control.value) > Number(price.value);

    return greaterThan ? { salePrice: false } : null;
  }

  return null;
};

export const greaterPriceThanSalePriceValidator: ValidatorFn = (form: FormGroup) => {
  const price = form.get('price').value;
  const salePrice = form.get('salePrice').value;

  return salePrice && price <= salePrice ? { salePriceGreater: true } : null;
};

export const greaterStartDateThanEndDateValidator: ValidatorFn = (form: FormGroup) => {
  const saleStartDate = moment(form.get('saleStartDate').value,'DD.MM.YYYY');
  const saleEndDate = moment(form.get('saleEndDate').value,'DD.MM.YYYY');

  return moment(saleStartDate).isAfter(saleEndDate) ? { saleStartDateGreater: true } : null;
};

export const dateValidator: ValidatorFn = (control: AbstractControl) => {
  if (!control.value) {
    return null;
  }
  if (!/^\d{2}\.\d{2}\.\d{4}$/.exec(control.value)) {
    return { pattern: true };
  }
  if (!moment(control.value, 'DD.MM.YYYY', true).isValid()) {
    return { dateDoesNotExist: true };
  }

  return null;
}

@Component({
  selector: 'main-section',
  templateUrl: 'editor-main-section.component.html',
  styleUrls: ['editor-main-section.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [ErrorBag],
})
export class EditorMainSectionComponent extends FormAbstractComponent<MainSection> implements OnInit, AfterViewInit {
  readonly section: ProductEditorSections = ProductEditorSections.Main;

  productType: ProductTypes = ProductTypes.Physical;
  currency: string;
  mainSection: MainSection = this.sectionsService.mainSection;
  formScheme: FormScheme;
  formTranslationsScope = 'mainSection.form';
  blobs: string[] = [];
  saleStartDateFormControl: AbstractControl;
  saleEndDateFormControl: AbstractControl;

  public productTypes: SelectOptionInterface[] = [];
  public productConditions: SelectOptionInterface[] = [];

  protected formStorageKey = 'mainSection.form';

  protected dateMask = dateMask;

  constructor(
    injector: Injector,
    protected errorBag: ErrorBag,
    public languageService: LanguageService,
    private sectionsService: SectionsService,
    private countryService: CountryService,
    private currencyService: CurrencyService,
    private dateTimePicker: PeDateTimePickerService,
    private localeService: LocaleService,
    private translateService: TranslateService,
    private domSanitizer: DomSanitizer,
    private matIconRegistry: MatIconRegistry,
  ) {
    super(injector);
    this.onToggleSale = this.onToggleSale.bind(this);

    this.matIconRegistry.addSvgIcon(
      'datepicker',
      this.domSanitizer.bypassSecurityTrustResourceUrl('assets/icons/datepicker.svg'),
    );
  }

  ngOnInit(): void {
    this.currency = this.currencyService.currency;

    merge(
      this.sectionsService.saveClicked$.pipe(
        tap(() => this.doSubmit())
      ),
      this.languageService.updatedLanguage$.pipe(
        tap((productModel: ProductModel) => {
          this.mainSection = this.sectionsService.mainSection;
          this.updateForm(productModel);
          this.onChangePictures(productModel.images);
        })
      ),
      this.countryService.updatedCountry$.pipe(
        tap((product) => {
          this.form.get('price').setValue(product.price);
          this.form.get('salePrice').setValue(product.sale.salePrice);
        }),
      )
    ).pipe(
      takeUntil(this.destroyed$)
    ).subscribe();

    this.sectionsService.recurringBillingChange$
      .pipe(
        takeUntil(this.destroyed$),
        filter(d => !!d),
      )
      .subscribe((data) => {
        this.toggleControl('onSales', !data.enabled);
      });

    this.productTypes = this.createSelectOptions(Object.values(ProductTypes));
    this.productConditions = this.createSelectOptions(Object.values(ProductConditions));

    this.productType = this.sectionsService.productType;
    this.sectionsService.productType$.next(this.productType);
  }

  onChangePictures(blobs: string[]): void {
    this.blobs = blobs;
    this.sectionsService.onChangeMainSection(Object.assign({}, this.form.getRawValue(), { images: this.blobs }));
    this.changeDetectorRef.detectChanges();
  }

  onPicturesLoadingChanged(loading: boolean): void {
    this.sectionsService.isUpdating$.next(loading);
  }

  onToggleSale(event: any): void {
    this.form.controls.onSales.setValue(!this.form.controls.onSales.value);
    this.form.controls.onSales.updateValueAndValidity();
  }

  openDatepicker(event, controlName: string): void {
    const startDate = this.form.get('saleStartDate').value;
    const endDate = this.form.get('saleEndDate').value;

    const minDate = controlName === 'saleEndDate' && startDate
      ? moment(startDate, 'DD.MM.YYYY').toDate()
      : new Date();
    const maxDate = controlName === 'saleStartDate' && endDate
      ? moment(endDate, 'DD.MM.YYYY').toDate()
      : null;

    const dialogRef = this.dateTimePicker.open(event, {
      config: { headerTitle: '', range: false, minDate, maxDate },
      position: {
        originX: 'center',
        originY: 'top',
        overlayX: 'center',
        overlayY: 'bottom',
        offsetX: 18,
        offsetY: -25,
      },
    });
    dialogRef.afterClosed.subscribe((date) => {
      if (date?.start) {
        this.form.get(controlName)
          .patchValue(moment(date.start).format('DD.MM.YYYY'));
        this.form.get(controlName).markAsTouched();
        event.target.focus();
        this.saleStartDateFormControl.updateValueAndValidity();
        this.saleEndDateFormControl.updateValueAndValidity();
        this.changeDetectorRef.detectChanges();
      }
    });
  }

  private updateForm(model: ProductModel) {
    const { brand, condition, productType, title, price, available } = model;
    const salePrice = model.sale.salePrice;
    const onSales = model.sale.onSales;
    const saleEndDate = model.sale.saleEndDate;
    const saleStartDate = model.sale.saleStartDate;

    this.form.setValue({
      productType,
      condition,
      brand,
      title,
      price,
      available,
      salePrice,
      onSales,
      saleEndDate,
      saleStartDate,
    });
  }

  protected createForm(initialData: MainSection): void {
    const validProductFieldRegex: RegExp = /^[^-\s].*/;
    const data: MainSection = this.mainSection;
    data.price = data.price > 0 ? data.price : null;
    this.form = this.formBuilder.group({
      productType: [data.productType, Validators.required],
      condition: [data.condition],
      brand: [data.brand, Validators.pattern(validProductFieldRegex)],
      title: [data.title, [Validators.required, Validators.pattern(validProductFieldRegex)]],
      price: [data.price, [Validators.required, Validators.min(0), Validators.max(MAX_VALUE)]],
      available: [data.available, Validators.required],
      salePrice: [
        data.salePrice,
        data.onSales || data.saleStartDate || data.saleEndDate
          ? [Validators.required, Validators.min(0), Validators.max(MAX_VALUE)]
          : [Validators.min(0), Validators.max(MAX_VALUE)],
      ],
      saleStartDate: [
        data.saleStartDate && formatDate(data.saleStartDate, 'dd.MM.YYYY', this.localeService.currentLocale$.value.code),
        data.salePrice
          ? [Validators.required, dateValidator]
          : [dateValidator],
      ],
      saleEndDate: [
        data.saleEndDate && formatDate(data.saleEndDate, 'dd.MM.YYYY', this.localeService.currentLocale$.value.code),
        data.salePrice
          ? [Validators.required, dateValidator]
          : [dateValidator],
      ],
      onSales: [data.onSales],
    }, { validators: [greaterPriceThanSalePriceValidator, greaterStartDateThanEndDateValidator] });

    this.saleStartDateFormControl = this.form.controls.saleStartDate;
    this.saleEndDateFormControl = this.form.controls.saleEndDate;
    this.onSalePriceChange(data.salePrice);

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

  onPriceChange(value: number): void {
    if (value < 0) {
      this.form.get('price').patchValue(0);
    }
  }

  onSalePriceChange(value: number): void {
      if (value > 0){
        this.saleStartDateFormControl.setValidators([dateValidator, Validators.required]);
        this.saleEndDateFormControl.setValidators([dateValidator, Validators.required]);
      } else {
        this.saleStartDateFormControl.setValidators([dateValidator]);
        this.saleEndDateFormControl.setValidators([dateValidator]);
      }
      this.saleStartDateFormControl.updateValueAndValidity();
      this.saleEndDateFormControl.updateValueAndValidity();
  }

  onSaleDateChange () {
    if (this.form.get('saleStartDate').value?.length > 0 || this.form.get('saleEndDate').value?.length > 0) {
      this.form.controls.salePrice.setValidators([Validators.required, Validators.min(0)]);
    } else {
      this.form.controls.salePrice.setValidators([Validators.min(0)]);
    }
    this.form.controls.salePrice.updateValueAndValidity();
  }

  get salePriceInvalid() {
    return this.isSubmitted && (this.form?.controls?.salePrice?.invalid || this.form.errors?.salePriceGreater)
      || this.form.controls.salePrice.errors?.max;
  }

  get salePriceErrorMessage() {
    if (this.form.controls.salePrice.errors?.required) {
      return this.translateService.translate('mainSection.form.errors.sale_price_required');
    }
    if (this.form.controls.salePrice.errors?.min) {
      return this.translateService.translate('mainSection.form.errors.price_no_negative');
    }
    if (this.form.controls.salePrice.errors?.max) {
      const field = this.translateService.translate('placeholders.salePrice');
      return this.translateService.translate('errors.max_number', { field });
    }
    if (this.form.errors?.salePriceGreater) {
      return this.translateService.translate('mainSection.form.errors.sale_price');
    }

    return null;
  }

  get priceInvalid() {
    return this.isSubmitted && this.form.controls.price.invalid || this.form.controls.price.errors?.max
  }

  get priceErrorMessage() {
    if (this.form.controls.price.errors?.required) {
      return this.translateService.translate('mainSection.form.errors.price_required');
    }
    if (this.form.controls.price.errors?.min) {
      return this.translateService.translate('mainSection.form.errors.price_no_negative');
    }
    if (this.form.controls.price.errors?.max) {
      const field = this.translateService.translate('placeholders.price');
      return this.translateService.translate('errors.max_number', { field });
    }

    return null;
  }

  get saleStartDateInvalid() {
    return (
      this.isSubmitted &&
      (this.form.errors?.saleStartDateGreater || this.saleStartDateFormControl.invalid)
    );
  }

  get saleStartDateErrorMessage() {
    if (this.form.errors?.saleStartDateGreater ) {
      return this.translateService.translate('mainSection.form.errors.start_date_greater_than_end');
    }

    if (this.saleStartDateFormControl.errors?.dateDoesNotExist) {
      return this.translateService.translate('mainSection.form.errors.date_does_not_exist');
    }

    if (this.saleStartDateFormControl.errors?.pattern) {
      return this.translateService.translate('mainSection.form.errors.invalid_date_format');
    }

    if (this.saleStartDateFormControl.errors?.required){
      return this.translateService.translate('mainSection.form.errors.start_date_required');
    }

    return null;
  }

  get saleEndDateInvalid() {
    return this.isSubmitted && this.saleEndDateFormControl.invalid;
  }

  get saleEndDateErrorMessage() {
    if (this.saleEndDateFormControl.errors?.dateDoesNotExist) {
      return this.translateService.translate('mainSection.form.errors.date_does_not_exist');
    }

    if (this.saleEndDateFormControl.errors?.pattern) {
      return this.translateService.translate('mainSection.form.errors.invalid_date_format');
    }

    if (this.saleEndDateFormControl.errors?.required){
      return this.translateService.translate('mainSection.form.errors.end_date_required');
    }

    return null;
  }

  private createSelectOptions(values: string[]) {
    return values.map((type: ProductConditions) => {
      return {
        label: type[0].toUpperCase() + type.substr(1).toLowerCase(),
        value: type,
      };
    });
  }

}
