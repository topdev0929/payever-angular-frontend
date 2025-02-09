import { Component, Injector, OnDestroy, OnInit } from '@angular/core';

import {
  BubbleWidgetSettingsInterface,
  WidgetType
} from '../../../interfaces';
import { AbstractWidgetSettingsComponent } from '../abstract-widget-settings.component';

interface BubbleSettingsFormInterface {
  isVisible: boolean;
  isCalculatorOverlay: boolean;
  isCheckoutOverlay: boolean;
}

@Component({
  selector: 'checkout-channel-bubble',
  templateUrl: './bubble.component.html',
  styleUrls: ['./bubble.component.scss']
})
export class BubbleComponent extends AbstractWidgetSettingsComponent implements OnInit, OnDestroy {

  channelSetType: WidgetType = 'bubble';

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
          title: 'channels.bubble.name',
          isActive: true,
          onClick: () => this.isGeneratedCode = false
        },
        this.getGenerateHtmlButton()
      ]
    );
  }

  ngOnDestroy(): void {
    super.ngOnDestroy();

    // Bubble widget created outside of app
    const bubbleElement: HTMLElement = document.querySelector('.payever-finance-express-bubble');
    if (bubbleElement) {
      bubbleElement.remove();
    }
  }

  protected createForm(settings: BubbleWidgetSettingsInterface) {
    this.isCalculatorOverlay = settings && settings.linkTo === 'finance_calculator';
    this.isCheckoutOverlay = settings && settings.linkTo === 'finance_express';

    if ( !this.isCalculatorOverlay && !this.isCalculatorOverlay ) {
      this.isCheckoutOverlay = true;
    }

    this.isVisibility = settings && settings.visibility;

    this.form = this.formBuilder.group({
      isVisible: this.isVisibility,
      isCalculatorOverlay: this.isCalculatorOverlay,
      isCheckoutOverlay: this.isCheckoutOverlay
    });

    this.subscribeToFormUpdate();
  }

  protected getUpdatedSettings(): BubbleWidgetSettingsInterface {
    const formValue: BubbleSettingsFormInterface = this.form.value;

    return {
      visibility: formValue.isVisible,
      linkTo: formValue.isCheckoutOverlay ? 'finance_express' : formValue.isCalculatorOverlay ? 'finance_calculator' : ''
    };
  }

  protected initValidators(): void {
  }
}
