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

@Directive({
  selector: '[peInputMask]',
})
export class InputMaskDirective implements OnInit, OnDestroy, ControlValueAccessor {

  private onChange: (value: any) => void;
  private onTouch: () => void;
  private listeners: (() => void)[] = [];

  @Input() mask: (value: string) => string = (value: string) => value;
  @Input() unmask: (value: string) => string | number | boolean = (value: string) => value;

  constructor(
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
    const el = this.elementRef.nativeElement as HTMLInputElement;
    el.value && (el.value = this.mask(el.value));

    this.listeners.push(
      this.renderer.listen(el, 'input', (event: Event) => {
        const target = event.target as HTMLInputElement;
        target.value = this.mask(target.value);
        const value = this.unmask ? this.unmask(target.value) : target.value;

        this.onChange?.(value);
      }),
      this.renderer.listen(el, 'focusout', () => {
        this.onTouch();
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
}
