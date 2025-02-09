import { Directive, ElementRef, Inject, Input, NgZone, Optional, ViewContainerRef } from '@angular/core';
import { Overlay, ScrollDispatcher, ScrollStrategy } from '@angular/cdk/overlay';
import { Platform } from '@angular/cdk/platform';
import { AriaDescriber, FocusMonitor } from '@angular/cdk/a11y';
import { Directionality } from '@angular/cdk/bidi';
import { MAT_TOOLTIP_DEFAULT_OPTIONS, MAT_TOOLTIP_SCROLL_STRATEGY, MatTooltip, MatTooltipDefaultOptions } from '@angular/material/tooltip';

import { TooltipPosition } from '../types';

@Directive({
  selector: '[peTooltip]',
  host: {
    '(longpress)': 'show()',
    '(keydown)': '_handleKeydown($event)',
    '(touchend)': '_handleTouchend()'
  }
})
export class TooltipDirective extends MatTooltip {
  @Input()
  set tooltipPosition(position: TooltipPosition) {
    this.position = position;
  }
  get tooltipPosition(): TooltipPosition {
    return this.position;
  }

  @Input()
  set tooltipDisabled(disabled: boolean) {
    this.disabled = disabled;
  }
  get tooltipDisabled(): boolean {
    return this.disabled;
  }

  @Input()
  set peTooltip(message: string) {
    this.message = message;
  }
  get peTooltip(): string {
    return this.message;
  }

  @Input()
  set tooltipCustomClass(value: string|string[]|Set<string>|{[key: string]: any}) {
    this.tooltipClass = value;
  }
  get tooltipCustomClass(): string|string[]|Set<string>|{[key: string]: any} {
    return this.tooltipClass;
  }

  constructor(
    overlay: Overlay,
    elementRef: ElementRef,
    scrollDispatcher: ScrollDispatcher,
    viewContainerRef: ViewContainerRef,
    ngZone: NgZone,
    platform: Platform,
    ariaDescriber: AriaDescriber,
    focusMonitor: FocusMonitor,
    @Inject(MAT_TOOLTIP_SCROLL_STRATEGY) scrollStrategy: ScrollStrategy,
    @Optional() dir: Directionality,
    @Optional() @Inject(MAT_TOOLTIP_DEFAULT_OPTIONS) defaultOptions?: MatTooltipDefaultOptions) {
    super(overlay, elementRef, scrollDispatcher, viewContainerRef, ngZone, platform, ariaDescriber, focusMonitor, scrollStrategy, dir, defaultOptions);
  }

}
