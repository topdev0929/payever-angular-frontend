import { DebugElement } from '@angular/core';
import { ComponentFixture } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { Observable } from 'rxjs';

import { FlowInterface } from '@pe/checkout/types';

import {
  FieldInputTester, FieldPhoneTester, FieldGoogleAutocompleteTester, FieldDatepickerTester,
  FieldIbanTester, FieldCurrencyTester, FieldSelectTester, FieldCheckboxTester, FieldInputWithMaskTester,
} from './field-tester';

export interface DevComponentInterface {
  createFlow(assignData: FlowInterface): Observable<boolean>;
  onConfirm(): void;
}

export class PaymentCustomElementTester<DevComponent extends DevComponentInterface> {

  constructor(
    private stepIndex: number,
    private rootSelector: string,
    private containerSelector: string,

    private devFixture: ComponentFixture<DevComponent>,
    private devComponent: DevComponent,

    private rateNotSelectedErrorSelector: string,
    private successFinishModalSelectorOrText: string,
    private failedFinishModalSelectorOrText: string,
    private pendingFinishModalSelectorOrText: string
  ) {}

  getInput(key: string): FieldInputTester {
    return new FieldInputTester(key, this.devFixture, this);
  }

  getInputWithMask(key: string): FieldInputWithMaskTester {
    return new FieldInputWithMaskTester(key, this.devFixture, this);
  }

  getPhone(key: string): FieldPhoneTester {
    return new FieldPhoneTester(key, this.devFixture, this);
  }

  getGoogleAutocomplete(key: string): FieldGoogleAutocompleteTester {
    return new FieldGoogleAutocompleteTester(key, this.devFixture, this);
  }

  getDatepicker(key: string): FieldDatepickerTester {
    return new FieldDatepickerTester(key, this.devFixture, this);
  }

  getIban(key: string): FieldIbanTester {
    return new FieldIbanTester(key, this.devFixture, this);
  }

  getCurrency(key: string): FieldCurrencyTester {
    return new FieldCurrencyTester(key, this.devFixture, this);
  }

  getSelect(key: string): FieldSelectTester {
    return new FieldSelectTester(key, this.devFixture, this);
  }

  getCheckbox(key: string): FieldCheckboxTester {
    return new FieldCheckboxTester(key, this.devFixture, this);
  }

  stepShouldBeVisible(visible: boolean): void {
    if (visible) {
      this.getContainerAndCheck();
    } else {
      const rootElement: DebugElement = this.devFixture.debugElement.query(By.css(this.rootSelector));
      expect(rootElement).toBeNull(`Step ${this.stepIndex} root element should be NOT visible`);
    }
  }

  querySelector<T extends Element>(selector: string): T {
    return this.getContainerAndCheck().querySelector<T>(selector);
  }

  rateSelectorShouldBeVisible(visible: boolean): HTMLElement {
    const chooseRate: HTMLElement = this.querySelector('pe-choose-rate');
    expect(!!chooseRate).toEqual(visible, `Rate selector should be ${visible ? '' : 'NOT'} visible`);

    return chooseRate;
  }

  async selectRateInRateSelector(index = 0): Promise<void> {
    // Open rates dropdown
    const chooseRate: HTMLElement = this.rateSelectorShouldBeVisible(true);
    const matCard: HTMLElement = chooseRate.querySelector('mat-card');
    expect(matCard).not.toBeNull('\'mat-card\' of \'pe-choose-rate\' should be visible');
    matCard.click();
    // Select first rate in list
    const rate: HTMLElement = chooseRate.querySelectorAll('div.rates-dropdown-option').item(index) as any;
    expect(!!rate).toEqual(true);
    rate.click();
    this.devFixture.detectChanges();
    await this.devFixture.whenStable();
    await this.devFixture.whenRenderingDone();
  }

  submitButtonShouldBeVisible(visible: boolean): HTMLElement {
    const mainButton: HTMLButtonElement = this.querySelector('button');
    expect(!!mainButton).toEqual(visible, 'Submit button of step should be visible');

    return mainButton;
  }

  submitButtonTriggerClick(): void {
    const button: HTMLElement = this.submitButtonShouldBeVisible(true);
    button.click();
    this.devFixture.detectChanges();
  }

  rateSelectorShouldHaveRateNotSelectedError(hasError: boolean): HTMLElement {
    const rateNotSelectedError: HTMLElement = this.querySelector(this.rateNotSelectedErrorSelector);
    expect(!!rateNotSelectedError).toEqual(hasError, `Rate not selected error should be ${hasError ? '' : 'NOT'} presented`);

    return rateNotSelectedError;
  }

  finishModalShouldBeVisible(visible: boolean): HTMLElement {
    const modal: HTMLButtonElement = this.querySelector('pe-modal');
    expect(!!modal).toEqual(visible, `Finish modal should be ${visible ? '' : 'NOT'} visible`);

    return modal;
  }

  finishModalShouldBeVisibleAsSuccess(visible: boolean): void {
    const modal: HTMLElement = this.finishModalShouldBeVisible(true);
    const status = !!modal.querySelector(this.successFinishModalSelectorOrText)
      || modal.innerText.indexOf(this.successFinishModalSelectorOrText) >= 0;
    expect(!!status).toEqual(visible, `Finish modal should be ${visible ? '' : 'NOT'} visible as Success status`);
  }

  finishModalShouldBeVisibleAsFailed(visible: boolean): void {
    const modal: HTMLElement = this.finishModalShouldBeVisible(true);
    const status = !!modal.querySelector(this.failedFinishModalSelectorOrText)
      || modal.innerText.indexOf(this.failedFinishModalSelectorOrText) >= 0;
    expect(!!status).toEqual(visible, `Finish modal should be ${visible ? '' : 'NOT'} visible as Failed status`);
  }

  changePaymentMethodShouldBeVisible(visible: boolean): HTMLElement {
    let button: HTMLButtonElement = null;
    this.finishModalShouldBeVisible(true).querySelectorAll('.modal-footer button').forEach((a: HTMLButtonElement) => {
      if (a.innerText === 'checkout_sdk.action.change_payment_method') {
        button = a;
      }
    });
    expect(!!button).toEqual(visible, `Change payment button should be ${visible ? '' : 'NOT'} visible`);

    return button;
  }

  getBody(): HTMLElement {
    const rootElement: DebugElement = this.devFixture.debugElement;

    // For shadow dom it's hard to query element, process is more complicated:
    const shadowDoc = rootElement.nativeElement.ownerDocument;
    const body: HTMLElement = shadowDoc.body;
    expect(body).not.toBeNull('Body should be visible');

    return body;
  }

  private getContainerAndCheck(): HTMLElement {
    const rootElement: DebugElement = this.devFixture.debugElement.query(By.css(this.rootSelector));
    expect(rootElement).not.toBeNull(`Step ${this.stepIndex} root element should be visible`);

    // For shadow dom it's hard to query element, process is more complicated:
    const shadowDoc = rootElement.nativeElement.ownerDocument;
    const containerElement: HTMLElement = shadowDoc.querySelector(this.containerSelector);
    expect(containerElement).not.toBeNull(`Step ${this.stepIndex} container should be visible`);

    return containerElement;
  }
}
