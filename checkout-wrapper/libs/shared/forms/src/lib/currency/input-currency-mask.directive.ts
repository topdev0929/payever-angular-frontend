import {
  ChangeDetectorRef,
  Directive,
  ElementRef,
  Input,
  OnDestroy,
  OnInit,
  Renderer2,
  Self,
} from '@angular/core';
import { ControlValueAccessor, NgControl } from '@angular/forms';

import { LocaleConstantsService } from '@pe/checkout/utils';

import { currencyMaskFn, currencyUnmaskFn } from './currency-mask.util';

@Directive({
  selector: '[peInputCurrencyMask]',
})
export class InputCurrencyMaskDirective implements OnInit, OnDestroy, ControlValueAccessor {
  @Input('peInputCurrencyMask') currencyCode: string;

  private onChange: (value: any) => void;
  private onTouch: () => void;
  private listeners: (() => void)[] = [];

  constructor(
    private localeConstantsService: LocaleConstantsService,
    @Self() private ngControl: NgControl,
    private elementRef: ElementRef<HTMLInputElement>,
    private renderer: Renderer2,
    private cdr: ChangeDetectorRef,
  ) {
    this.ngControl.valueAccessor = this;
  }

  ngOnDestroy(): void {
    this.listeners.forEach(listener => listener());
  }

  ngOnInit(): void {
    const el = this.elementRef.nativeElement;
    el.value && (el.value = this.mask(el.value));

    this.listeners.push(
      this.renderer.listen(el, 'input', (event: Event) => {
        const target = event.target as HTMLInputElement;
        target.value = this.mask(target.value);
        const value = this.unmask ? this.unmask(target.value) : target.value;

        this.onChange(value);
      }),
      this.renderer.listen(el, 'focusout', () => {
        this.onTouch?.();
        this.cdr.markForCheck();
      }),
    );
  }

  writeValue(value: any): void {
    this.elementRef.nativeElement.value = this.mask(value) ?? '';
  }

  registerOnChange(fn: (value: any) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouch = fn;
  }

  private mask(value: string) {
    return currencyMaskFn(value, this.currencyCode, this.localeConstantsService.getLang());
  }

  private unmask(value: string) {
    return currencyUnmaskFn(value, this.currencyCode, this.localeConstantsService.getLang());
  }
}
