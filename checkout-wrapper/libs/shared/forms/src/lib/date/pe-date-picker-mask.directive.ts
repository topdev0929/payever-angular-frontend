import { Directive, ElementRef, HostBinding, HostListener, Input, OnInit, ViewContainerRef } from '@angular/core';
import { NgControl } from '@angular/forms';
import { DateAdapter } from '@angular/material/core';
import { takeUntil, tap } from 'rxjs/operators';

import { PeDestroyService } from '@pe/destroy';

import { DatePickerMaskGuideComponent, PeDatePickerMaskType } from './date-guide.component';
import { DATE_SETTINGS } from './date-settings.constant';
import { DayjsDateAdapter } from './dayjs-date-adapter.class';



@Directive({
  selector: 'input[peDatePickerMask]',
})
export class PeDatePickerMaskDirective implements OnInit {
  private static fullDateRegExp = /(\d{1,2})(\D)?(\d{1,2})?(\D)?(\d{1,4})?/;
  private static shortDateRegExp = /(\d{1,2})(\D)?(\d{1,4})?/;

  constructor(
    protected elementRef: ElementRef,
    private ngControl: NgControl,
    private dateAdapter: DateAdapter<DayjsDateAdapter>,
    private destroy$: PeDestroyService,
    private viewContainerRef: ViewContainerRef,
  ) { }

  @Input() peDatePickerMask: keyof typeof PeDatePickerMaskType;

  private separator: string;
  private format: string;
  private placeholder: string;
  private maskRegex: RegExp;
  private guid: DatePickerMaskGuideComponent;
  private focused = false;

  @HostBinding('style.width')
  private width: string;

  @HostBinding('style.padding-left')
  private paddingLeft: string;

  @HostListener('focus', ['$event'])
  onFocus(event: FocusEvent) {
    const input = event.target as HTMLInputElement;
    this.focused = true;
    this.onValueChanges(input);
  }

  @HostListener('focusout', ['$event'])
  onFocusout(event: FocusEvent) {
    const input = event.target as HTMLInputElement;
    this.focused = false;
    this.onValueChanges(input);
  }

  @HostListener('input', ['$event'])
  onInput(event: InputEvent) {
    const input = event.target as HTMLInputElement;

    const value = this.mask(input.value);
    const parsedValue = this.dateAdapter.parse(value, this.format);

    input.value = value;
    parsedValue && this.ngControl.control.setValue(parsedValue);
    this.onValueChanges(input);
  }

  private mask(value: string) {
    const groups = this.maskRegex.exec(value)?.slice(1) ?? [];

    return groups.map((group, index) => {
      const isSeparator = index % 2 !== 0;
      const next = groups[index + 1];
      const prev = groups[index - 1];

      if (isSeparator) {
        return prev && (group || next)
          ? this.separator
          : undefined;
      }

      return next ? group?.padStart(2, '0') : group;
    }).map((group, index) => {
      if (index === 4) {
        return Number(group) !== 0 && group;
      }
      if (group === '00') {
        return '0';
      }

      return group;
    }).filter(Boolean).join('');
  }

  ngOnInit(): void {
    if (!this.peDatePickerMask) {
      throw new Error('peDatePickerMask input is empty');
    }
    const setting = DATE_SETTINGS[this.peDatePickerMask];
    this.separator = setting.separator;
    this.format = setting.format;
    this.placeholder = setting.placeholder;
    this.maskRegex = PeDatePickerMaskType[this.peDatePickerMask] === PeDatePickerMaskType.shortDate
      ? PeDatePickerMaskDirective.shortDateRegExp
      : PeDatePickerMaskDirective.fullDateRegExp;

    this.initGuideComponent();

    const el: HTMLInputElement = this.elementRef.nativeElement;
    this.ngControl.control.valueChanges.pipe(
      tap(() => this.onValueChanges(el)),
      takeUntil(this.destroy$),
    ).subscribe();
  }

  private onValueChanges(input: HTMLInputElement) {
    const valueLength = input.value.length;
    const showGuide = (valueLength > 0 || this.focused) &&
      valueLength !== this.placeholder.length;

    this.guid.show = showGuide;
    this.guid.setText = this.placeholder.slice(valueLength);

    // a hidden span is use to calculate the width of the input
    // we can't use the css 'ch' metric, because not every character has the same width
    this.width = showGuide
      ? `${this.guid.getHiddenSpanWidth(input.value) || 1}px`
      : '100%';
    this.paddingLeft = valueLength ? '1px' : '0';
  }

  private initGuideComponent() {
    const el: HTMLInputElement = this.elementRef.nativeElement;
    const computedStyles = window.getComputedStyle(el);


    this.guid = this.viewContainerRef.createComponent(DatePickerMaskGuideComponent).instance;
    this.guid.font = computedStyles.font;
    this.guid.peDatePickerMask = this.peDatePickerMask;
    this.guid.separator = this.separator;

    this.onValueChanges(el);
  }
}
