import { Component, Injector, OnInit } from '@angular/core';
import { Validators } from '@angular/forms';
import { takeUntil } from 'rxjs/operators';

import {
  CheckoutInterface,
  ButtonWidgetSettingsInterface,
  WidgetType, ButtonBorderRadiusType
} from '../../../interfaces';
import { AbstractWidgetSettingsComponent } from '../abstract-widget-settings.component';

interface ButtonSettingsFormInterface {
  textColor: string;
  buttonColor: string;
  height: number;
  textSize: string;
  alignment: string;
  corners: string;
  isVisible: boolean;
  adaptiveDesign: boolean;
  isCalculatorOverlay: boolean;
  isCheckoutOverlay: boolean;
  width: number;
}

@Component({
  selector: 'checkout-channel-button',
  templateUrl: './button.component.html'
})
export class ButtonComponent extends AbstractWidgetSettingsComponent implements OnInit {

  channelSetType: WidgetType = 'button';
  currentCheckout: CheckoutInterface;

  alignmentType: string[] = ['center', 'left', 'right'];
  cornersType: ButtonBorderRadiusType[] = ['circle', 'round', 'square'];
  textSizeType: string[] =  ['12px', '14px', '16px', '18px'];

  private readonly defaultHeight: number = 40;
  private readonly minWidth: number = 320;
  private readonly maxWidth: number = 600;

  constructor(protected injector: Injector) {
    super(injector);
  }

  ngOnInit(): void {
    super.ngOnInit();
    this.headerService.setShortHeader(
      '', // 'channels.settings.name',
      () => this.goBack(),
      [
        {
          title: 'channels.settings.name',
          isActive: true,
          onClick: () => this.isGeneratedCode = false
        },
        this.getGenerateHtmlButton()
      ]
    );
  }

  protected createForm(settings: ButtonWidgetSettingsInterface) {
    const defaultStyles: ButtonWidgetSettingsInterface = {
      linkTo: 'finance_express',
      textSize: '14px',
      textColor: '#000000',
      buttonColor: '#ffffff',
      alignment: 'center',
      corners: 'round',
      adaptiveDesign: false,
      // calculatorOverlay: false,
      // checkoutOverlay: false,
      visibility: false,
      height: 40,
      width: this.minWidth
    };
    const buttonStyles = settings || defaultStyles;
    this.isCalculatorOverlay = buttonStyles.linkTo === 'finance_calculator';
    this.isCheckoutOverlay = buttonStyles.linkTo === 'finance_express';

    this.form = this.formBuilder.group({
      textColor: buttonStyles.textColor,
      buttonColor: buttonStyles.buttonColor,
      height: [buttonStyles.height || this.defaultHeight, [Validators.min(23), Validators.max(100)]],
      textSize: buttonStyles.textSize,
      alignment: buttonStyles.alignment,
      corners: buttonStyles.corners,
      isVisible: buttonStyles.visibility,
      adaptiveDesign: buttonStyles.adaptiveDesign,
      isCalculatorOverlay: this.isCalculatorOverlay,
      isCheckoutOverlay: this.isCheckoutOverlay,
      width: buttonStyles.width || 0
    });

    this.subscribeToFormUpdate();
  }

  subscribeToFormUpdate(): void {
    this.form.controls['adaptiveDesign'].valueChanges.pipe(takeUntil(this.destroyed$))
      .subscribe((isAdaptiveDesign: boolean) => {
        this.initValidators();
      });

    super.subscribeToFormUpdate();
  }

  protected getUpdatedSettings(): ButtonWidgetSettingsInterface {
    const formValue: ButtonSettingsFormInterface = this.form.value;

    return {
      linkTo: formValue.isCheckoutOverlay ? 'finance_express' : formValue.isCalculatorOverlay ? 'finance_calculator' : '',
      textSize: formValue.textSize,
      textColor: formValue.textColor,
      buttonColor: formValue.buttonColor,
      alignment: formValue.alignment,
      corners: formValue.corners,
      visibility: formValue.isVisible,
      adaptiveDesign: formValue.adaptiveDesign,
      height: formValue.height,
      width: formValue.width
    } as ButtonWidgetSettingsInterface;
  }

  protected initValidators(): void {
    const isAdaptive: boolean = this.form.controls['adaptiveDesign'].value;
    if (isAdaptive) {
      this.form.controls['width'].clearValidators();
    } else {
      this.form.controls['width'].setValidators([Validators.min(this.minWidth), Validators.max(this.maxWidth)]);
      this.setMinWidth();
    }
    this.form.controls['width'].updateValueAndValidity();
  }

  /**
   * Prevent break of widget if adaptive design is disabled by set of min width
   */
  private setMinWidth(): void {
    const width: number = this.form.controls['width'].value;
    if (!width || width === 0) {
      this.form.controls['width'].setValue(this.minWidth);
    }
  }
}
