import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { DebugElement } from '@angular/core';

import { CounterComponent } from './counter.component';
import { nonRecompilableTestModuleHelper } from '../../../../test';
import { CounterModule } from '../../counter.module';

describe('CounterComponent', () => {
  let fixture: ComponentFixture<CounterComponent>;
  let component: CounterComponent;

  const buttonMinusSelector: string = '.counter-button-minus';
  const buttonPlusSelector: string = '.counter-button-plus';
  const inputSelector: string = '.counter-input';

  nonRecompilableTestModuleHelper({
    imports: [
      CounterModule
    ]
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CounterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create component', () => {
    expect(component).toBeTruthy();
  });

  it('should accept @Input() value', () => {
    let input: DebugElement;

    expect(component.value).toBe(0);
    input = fixture.debugElement.query(By.css(inputSelector));
    expect(input).toBeTruthy();
    expect((input.nativeElement as HTMLInputElement).value).toBe('0', 'should be zero by default');

    component.value = 8766;
    fixture.detectChanges();
    expect((input.nativeElement as HTMLInputElement).value).toBe(String(component.value));
  });

  it('should accept @Input() minValue/maxValue -es', () => {
    let input: DebugElement;
    let value: number;
    const minValue: number = 88;
    const maxValue: number = 99;

    input = fixture.debugElement.query(By.css(inputSelector));

    expect(component.minValue).toBe(0);
    expect(component.maxValue).toBe(10000);

    expect(minValue).toBeLessThan(maxValue, 'self-check');

    component.minValue = minValue;
    component.maxValue = maxValue;
    fixture.detectChanges();
    expect(component.minValue).toBe(minValue);
    expect(component.maxValue).toBe(maxValue);

    value = (maxValue + 1);
    (input.nativeElement as HTMLInputElement).value = value.toString();
    fixture.detectChanges();
    component.onInput();
    expect(component.value).toBe(component.maxValue);
    expect(component.value).not.toBe(value);

    value = (minValue - 1);
    (input.nativeElement as HTMLInputElement).value = value.toString();
    component.onInput();
    expect(component.value).toBe(component.minValue);
    expect(component.value).not.toBe(value);

    value = Math.round((minValue + maxValue) / 2);
    (input.nativeElement as HTMLInputElement).value = value.toString();
    component.onInput();
    expect(component.value).toBeGreaterThan(minValue);
    expect(component.value).toBeLessThan(maxValue);
    expect(component.value).toBe(value);
  });

  it('should not accept @Input() minValue less than 0', () => {
    component.minValue = -1;
    fixture.detectChanges();
    expect(component.minValue).toBe(0);

    component.minValue = -100;
    fixture.detectChanges();
    expect(component.minValue).toBe(0);

    component.minValue = -1 / 10;
    fixture.detectChanges();
    expect(component.minValue).toBe(0);
  });

  it('should accept only integer value', () => {
    let input: DebugElement;

    component.value = -10 / 234;
    fixture.detectChanges();
    expect(component.value).toBe(component.minValue);
    input = fixture.debugElement.query(By.css(inputSelector));
    expect(input).toBeTruthy();
    expect((input.nativeElement as HTMLInputElement).value).toBe('0');

    component.value = 10 / 234;
    fixture.detectChanges();
    expect(component.value).toBe(component.minValue);
    input = fixture.debugElement.query(By.css(inputSelector));
    expect(input).toBeTruthy();
    expect((input.nativeElement as HTMLInputElement).value).toBe('0');
  });

  it('should accept @Input() readOnly', () => {
    let input: DebugElement;
    input = fixture.debugElement.query(By.css(inputSelector));
    expect(input).toBeTruthy();

    expect(component.readOnly).toBe(false);

    component.readOnly = true;
    fixture.detectChanges();
    expect(input.properties.readOnly).toBe(true);

    component.readOnly = false;
    fixture.detectChanges();
    expect(input.properties.readOnly).toBe(false);
  });

  it('should accept @Input() autoFocus()', () => {
    let input: DebugElement;
    input = fixture.debugElement.query(By.css(inputSelector));
    expect(input).toBeTruthy();

    expect(component.autoFocus).toBe(false);

    component.autoFocus = true;
    fixture.detectChanges();
    expect(input.properties.autofocus).toBe(true);

    component.autoFocus = false;
    fixture.detectChanges();
    expect(input.properties.autofocus).toBe(false);
  });

  it('should produce @Output() counterValueChange events on input', () => {
    let input: DebugElement;
    input = fixture.debugElement.query(By.css(inputSelector));
    expect(input).toBeTruthy();

    const value: number = Math.ceil(Math.random() * 1000 + 10);

    let emittedValue: number = null;
    expect(emittedValue).not.toBe(value);
    component.counterValueChange.subscribe(
      (value: number) => emittedValue = value,
      fail
    );

    expect(component.value).not.toBe(value);
    (input.nativeElement as HTMLInputElement).value = value.toString();
    (input.nativeElement as HTMLInputElement).dispatchEvent(new Event('input'));
    fixture.detectChanges();
    expect(component.value).toBe(value);
    expect(emittedValue).toBe(value);
  });

  it('should set zero for empty value', () => {
    let input: DebugElement;
    input = fixture.debugElement.query(By.css(inputSelector));
    expect(input).toBeTruthy();

    (input.nativeElement as HTMLInputElement).value = '';
    (input.nativeElement as HTMLInputElement).dispatchEvent(new Event('input'));
    fixture.detectChanges();
    expect(component.value).toBe(0);
    expect((input.nativeElement as HTMLInputElement).value).toBe('0');
  });

  it('should set higher value with "plus" button, until maxValue', () => {
    let buttonPlus: DebugElement;

    const maxValue: number = 999;
    const value: number = maxValue - 2;

    let emittedValueCount: number = 0;
    component.counterValueChange.subscribe(
      () => emittedValueCount++,
      fail
    );

    component.value = value;
    component.maxValue = maxValue;
    fixture.detectChanges();
    expect(emittedValueCount).toBe(0);

    buttonPlus = fixture.debugElement.query(By.css(buttonPlusSelector));
    expect(buttonPlus).toBeTruthy();

    (buttonPlus.nativeElement as HTMLButtonElement).click();
    fixture.detectChanges();
    expect(component.value).toBe(value + 1);
    expect(emittedValueCount).toBe(1);

    (buttonPlus.nativeElement as HTMLButtonElement).click();
    fixture.detectChanges();
    expect(component.value).toBe(value + 2);
    expect(component.value).toBe(maxValue);
    expect(emittedValueCount).toBe(2);

    (buttonPlus.nativeElement as HTMLButtonElement).click();
    fixture.detectChanges();
    expect(component.value).toBe(maxValue);
    expect(emittedValueCount).toBe(2);
  });

  it('should set higher value with "minus" button, until maxValue', () => {
    let buttonMinus: DebugElement;

    const minValue: number = 111;
    const value: number = minValue + 2;

    let emittedValueCount: number = 0;
    component.counterValueChange.subscribe(
      () => emittedValueCount++,
      fail
    );

    component.value = value;
    component.minValue = minValue;
    fixture.detectChanges();
    expect(emittedValueCount).toBe(0);

    buttonMinus = fixture.debugElement.query(By.css(buttonMinusSelector));
    expect(buttonMinus).toBeTruthy();

    (buttonMinus.nativeElement as HTMLButtonElement).click();
    fixture.detectChanges();
    expect(component.value).toBe(value - 1);
    expect(emittedValueCount).toBe(1);

    (buttonMinus.nativeElement as HTMLButtonElement).click();
    fixture.detectChanges();
    expect(component.value).toBe(value - 2);
    expect(component.value).toBe(minValue);
    expect(emittedValueCount).toBe(2);

    (buttonMinus.nativeElement as HTMLButtonElement).click();
    fixture.detectChanges();
    expect(component.value).toBe(minValue);
    expect(emittedValueCount).toBe(2);
  });
});
