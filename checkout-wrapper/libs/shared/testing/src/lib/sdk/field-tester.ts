import { timer } from 'rxjs';
import { flatMap, map } from 'rxjs/operators';

import { FlowInterface } from '@pe/checkout/types';

export interface DevComponentInterface {
  createFlow(assignData: FlowInterface): void;
  onConfirm(): void;
}

interface DevFixtureInterface {
  detectChanges(): void;
}

interface StepInterface {
  querySelector<T extends Element>(selector: string): T;
  getBody(): HTMLElement;
}

abstract class BaseFieldTester {

  constructor(private key: string, private devFixture: DevFixtureInterface, private step: StepInterface) {}

  abstract selector(key: string): string;

  shouldBeVisible(visible: boolean, enabled = true): HTMLInputElement {
    const input: HTMLInputElement = this.step.querySelector(this.selector(this.key));
    expect(!!input).toEqual(visible, `'${this.key}' should be ${visible ? '' : 'NOT'} visible`);
    if (!!input && visible) {
      const readonly: boolean = input.getAttribute('readonly') === 'true';
      expect(readonly).toEqual(!enabled, `'${this.key}' should ${readonly ? '' : 'NOT'} be disbled`);
    }

    return input;
  }

  async writeValue(value: any): Promise<void> {
    const input: HTMLInputElement = this.shouldBeVisible(true);
    input.value = value;

    return timer(50).pipe(flatMap((a) => {
      // More complicated because of currency input
      input.click();
      input.focus();
      input.dispatchEvent(new Event('focus'));
      input.dispatchEvent(new Event('input'));
      this.devFixture.detectChanges();

      return timer(50).pipe(map(a => null));
    })).toPromise();
  }

  shouldHaveError(hasError: boolean): void {
    const input: HTMLElement = this.shouldBeVisible(true);
    const status: boolean = input && input.getAttribute('aria-invalid') === 'true';
    expect(status).toEqual(hasError, `'${this.key}' should ${hasError ? '' : 'NOT'} show error`);
  }
}

export class FieldInputTester extends BaseFieldTester {
  selector(key: string): string {
    return `[pe-qa-input="${key}"]`;
  }
}

export class FieldInputWithMaskTester extends BaseFieldTester {
  selector(key: string): string {
    return `[pe-qa-input-with-mask="${key}"]`;
  }
}

export class FieldPhoneTester extends BaseFieldTester {
  selector(key: string): string {
    return `[pe-qa-phone-input="${key}"]`;
  }
}

export class FieldGoogleAutocompleteTester extends BaseFieldTester {
  selector(key: string): string {
    return `[pe-qa-autocomplete-google-places="${key}"]`;
  }
}

export class FieldDatepickerTester extends BaseFieldTester {
  selector(key: string): string {
    return `[pe-qa-datepicker="${key}"]`;
  }
}

export class FieldIbanTester extends BaseFieldTester {
  selector(key: string): string {
    return `[pe-qa-input-iban="${key}"]`;
  }
}

export class FieldCurrencyTester extends BaseFieldTester {
  selector(key: string): string {
    return `[pe-qa-input-currency="${key}"]`;
  }
}

export class FieldSelectTester {

  constructor(private key: string, private devFixture: DevFixtureInterface, private step: StepInterface) {}

  shouldBeVisible(visible: boolean, enabled = true): HTMLInputElement {
    const select: HTMLInputElement = this.step.querySelector(`[pe-qa-select="${this.key}"]`);
    expect(!!select).toEqual(visible, `Select '${this.key}' should be ${visible ? '' : 'NOT'} visible`);
    if (!!select && visible) {
      const readonly: boolean = select.getAttribute('readonly') === 'true';
      expect(readonly).toEqual(!enabled, `Select '${this.key}' should ${readonly ? '' : 'NOT'} be disbled`);
    }

    return select;
  }

  async chooseOptionIndex(index: number): Promise<void> {
    const select: HTMLElement = this.shouldBeVisible(true);
    select.click();
    this.devFixture.detectChanges();

    return timer(100).pipe(flatMap((a) => {
      const container: HTMLElement = this.step.getBody().querySelector('.cdk-overlay-container');
      expect(!!container).toEqual(true);
      const all = container.querySelectorAll('mat-option');
      const span = all[index >= 0 ? index : all.length + index].querySelector('span');
      expect(!!span).toEqual(true);
      span.click();
      this.devFixture.detectChanges();

      return timer(100);
    })).pipe(map(a => null)).toPromise();
  }
}

export class FieldCheckboxTester {

  constructor(private key: string, private devFixture: DevFixtureInterface, private step: StepInterface) {}

  shouldBeVisible(visible: boolean, enabled = true): HTMLElement {
    const checkbox: HTMLElement = this.step.querySelector(`mat-checkbox[pe-qa-checkbox="${this.key}"]`);
    expect(!!checkbox).toEqual(visible, `Checkbox '${this.key}' should be ${visible ? '' : 'NOT'} visible`);
    if (!!checkbox && visible) {
      const readonly: boolean = checkbox.getAttribute('readonly') === 'true';
      expect(readonly).toEqual(!enabled, `Checkbox '${this.key}' should ${readonly ? '' : 'NOT'} be disbled`);
    }

    return checkbox;
  }

  async toggle(): Promise<void> {
    const input: HTMLElement = this.shouldBeVisible(true);
    input.querySelector('label').click();
    this.devFixture.detectChanges();

   return timer(100).pipe(map(a => null)).toPromise();
  }
}
