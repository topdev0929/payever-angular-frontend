import { Component, Injector, OnInit } from '@angular/core';
import { Validators } from '@angular/forms';
import { takeUntil } from 'rxjs/operators';

import { PeAuthService, ExtraLoginData } from '@pe/auth';

import { BannerAndRatesWidgetSettingsInterface, LinkToType, WidgetType } from "../../../interfaces";
import { AbstractWidgetSettingsComponent } from '../abstract-widget-settings.component';

interface CalculatorSettingsFormInterface {
  textColor: string;
  buttonColor: string;
  linkColor: string;
  borderColor: string;
  bgColor: string;
  isCalculatorOverlay: boolean;
  isCheckoutOverlay: boolean;
  isVisible: boolean;
  adaptiveDesign: boolean;
  displayType: string;
  size: number;
  order: 'asc' | 'desc';
}

@Component({
  selector: 'checkout-channel-calculator',
  templateUrl: './calculator.component.html',
})
export class CalculatorComponent extends AbstractWidgetSettingsComponent implements OnInit {

  channelSetType: WidgetType = 'banner-and-rate';
  hiddenFields: string[] = [];

  private readonly defaultSize: number = 500;
  private readonly hiddenFieldsDictionary: any = {
    de: ['linkColor', 'bgColor'],
    dk: ['buttonColor'],
    no: ['buttonColor', 'linkColor', 'borderColor'],
  };

  private readonly minWidth: number = 360;

  constructor(protected injector: Injector,
              private authService: PeAuthService) {
    super(injector);
  }

  ngOnInit(): void {
    super.ngOnInit();
    this.headerService.setShortHeader(
      '',
      () => this.goBack(),
      [
        {
          title: 'channels.calculator.name',
          isActive: true,
          onClick: () => this.isGeneratedCode = false,
        },
        this.getGenerateHtmlButton(),
      ]
    );
  }

  isFieldVisible(fieldName: string): boolean {
    let visible = true;
    if (this.hiddenFields) {
      visible = this.hiddenFields.indexOf(fieldName) < 0;
    }

    return visible;
  }

  subscribeToFormUpdate(): void {
    this.form.controls['adaptiveDesign'].valueChanges.pipe(takeUntil(this.destroyed$))
      .subscribe((isAdaptiveDesign: boolean) => {
        this.initValidators();
      });

    super.subscribeToFormUpdate();
  }

  protected createForm(settings: BannerAndRatesWidgetSettingsInterface) {
    this.setHiddenFields();

    const defaultStyles: BannerAndRatesWidgetSettingsInterface = {
      textColor: '#ff0000',
      buttonColor: '#000000',
      linkColor: '#fff90d',
      borderColor: '#000000',
      bgColor: '#fff',
      adaptiveDesign: false,
      visibility: false,
      linkTo: 'finance_express',
      order: 'asc',
      size: this.defaultSize || 0,
    };
    const calculatorStyles = settings || defaultStyles;
    this.isCalculatorOverlay = calculatorStyles.linkTo === 'finance_calculator';
    this.isCheckoutOverlay = calculatorStyles.linkTo === 'finance_express';

    this.form = this.formBuilder.group({
      textColor: calculatorStyles.textColor,
      buttonColor: calculatorStyles.buttonColor,
      linkColor: calculatorStyles.linkColor,
      borderColor: calculatorStyles.borderColor,
      bgColor: calculatorStyles.bgColor,
      isCalculatorOverlay: this.isCalculatorOverlay,
      isCheckoutOverlay: this.isCheckoutOverlay,
      isVisible: calculatorStyles.visibility,
      adaptiveDesign: calculatorStyles.adaptiveDesign,
      displayType: 'rate', // TODO CHECK HOW IT CHANGES
      size: calculatorStyles.size || 0,
      order: calculatorStyles.order || 'asc',
    });

    this.subscribeToFormUpdate();
  }

  protected getUpdatedSettings(): BannerAndRatesWidgetSettingsInterface {
    const formValue: CalculatorSettingsFormInterface = this.form.value;
    let linkTo: LinkToType = '';

    if (formValue.isCheckoutOverlay) {
      linkTo = 'finance_express'
    } else if (formValue.isCalculatorOverlay) {
      linkTo = 'finance_calculator'
    };

    return {
      linkTo,
      textColor: formValue.textColor,
      buttonColor: formValue.buttonColor,
      linkColor: formValue.linkColor,
      borderColor: formValue.borderColor,
      bgColor: formValue.bgColor,
      visibility: formValue.isVisible,
      adaptiveDesign: formValue.adaptiveDesign,
      displayType: formValue.displayType,
      size: formValue.size || 0,
      order: formValue.order,
    } as BannerAndRatesWidgetSettingsInterface;
  }

  protected initValidators(): void {
    if (this.form.controls['adaptiveDesign'].value) {
      this.form.controls['size'].clearValidators();
    } else {
      this.form.controls['size'].setValidators([Validators.min(this.minWidth), Validators.max(800)]);
      this.setMinWidth();
    }
    this.form.controls['size'].updateValueAndValidity();
  }

  /**
   * Set hidden fields depends on country
   */
  private setHiddenFields(): void {
    // HIDE fields that not needed for country
    // NOTE: be careful - activeBusiness has "any" type in ng-kit
    // NOTE: this service return data only if opened from commerceos
    const loginData: ExtraLoginData = this.authService.refreshLoginData;
    if (loginData?.activeBusiness?.companyAddress?.country) {
      const country: string = loginData.activeBusiness.companyAddress.country.toLowerCase();
      this.hiddenFields = this.hiddenFieldsDictionary[country] || [];
    }
  }

  /**
   * Prevent break of widget if adaptive design is disabled by set of min width
   */
  private setMinWidth(): void {
    const width: number = this.form.controls['size'].value;
    if (!width || width === 0) {
      this.form.controls['size'].setValue(this.minWidth);
    }
  }
}
