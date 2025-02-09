import { Component, Injector, OnInit } from '@angular/core';
import { Validators } from '@angular/forms';
import { takeUntil } from 'rxjs/operators';

import { WidgetType, TextLinkWidgetSettingsInterface, LinkToType } from "../../../interfaces";
import { AbstractWidgetSettingsComponent } from '../abstract-widget-settings.component';

interface TextLinkFormInterface {
  linkColor: string;
  height: number;
  textSize: string;
  alignment: string;
  isVisible: boolean;
  adaptiveDesign: boolean;
  isCalculatorOverlay: boolean;
  isCheckoutOverlay: boolean;
  width: number;
}

@Component({
  selector: 'checkout-text-link',
  templateUrl: './text-link.component.html',
  styleUrls: ['./text-link.component.scss'],
})
export class TextLinkComponent extends AbstractWidgetSettingsComponent implements OnInit {

  channelSetType: WidgetType = 'text-link';

  alignmentType: { name: string, value: string }[] = [
    {
      name: 'center-16',
      value: 'center',
    },
    {
      name: 'left-16',
      value: 'left',
    },
    {
      name: 'right-16',
      value: 'right',
    },
  ];

  textSizeType: string[] = ['12px', '14px', '16px', '18px'];

  private readonly DEFAULT_HEIGHT: number = 20;
  private readonly MIN_WIDTH: number = 260;

  constructor(protected injector: Injector) {
    super(injector);
  }

  ngOnInit(): void {
    super.ngOnInit();
    this.headerService.setShortHeader(
      '',
      () => this.goBack(),
      [
        {
          title: 'channels.textLink.name',
          isActive: true,
          onClick: () => this.isGeneratedCode = false,
        },
        this.getGenerateHtmlButton(),
      ]
    );
  }

  onOpenConnect() {
    this.router.navigate([this.storageService.getConnectAppUrl()]);
  }

  protected createForm(settings: TextLinkWidgetSettingsInterface) {
    const defaultStyles: TextLinkWidgetSettingsInterface = {
      textSize: '14px',
      linkColor: '#fff',
      alignment: 'center',
      adaptiveDesign: false,
      visibility: false,
      height: this.DEFAULT_HEIGHT,
      width: this.MIN_WIDTH,
    };
    const textLinkStyles = settings || defaultStyles;
    this.isCalculatorOverlay = textLinkStyles.linkTo === 'finance_calculator';
    this.isCheckoutOverlay = textLinkStyles.linkTo === 'finance_express';

    this.form = this.formBuilder.group({
      linkColor: textLinkStyles.linkColor,
      height: [textLinkStyles.height || this.DEFAULT_HEIGHT, Validators.max(100)],
      textSize: textLinkStyles.textSize,
      alignment: textLinkStyles.alignment,
      isVisible: textLinkStyles.visibility,
      adaptiveDesign: textLinkStyles.adaptiveDesign,
      isCalculatorOverlay: this.isCalculatorOverlay,
      isCheckoutOverlay: this.isCheckoutOverlay,
      width: textLinkStyles.width || 0,
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

  protected getUpdatedSettings(): TextLinkWidgetSettingsInterface {
    const formValue: TextLinkFormInterface = this.form.value;
    let linkTo: LinkToType = '';
    if (formValue.isCheckoutOverlay) {
      linkTo = 'finance_express';
    } else if (formValue.isCalculatorOverlay) {
      linkTo = 'finance_calculator';
    }

    return {
      linkTo,
      textSize: formValue.textSize,
      alignment: formValue.alignment,
      linkColor: formValue.linkColor,
      visibility: formValue.isVisible,
      adaptiveDesign: formValue.adaptiveDesign,
      height: formValue.height,
      width: formValue.width,
    };
  }

  protected initValidators(): void {
    if (this.form.controls['adaptiveDesign'].value) {
      this.form.controls['width'].clearValidators();
    } else {
      this.form.controls['width'].setValidators(Validators.min(this.MIN_WIDTH));
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
      this.form.controls['width'].setValue(this.MIN_WIDTH);
    }
  }
}
