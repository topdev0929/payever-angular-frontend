import {
  ChangeDetectorRef, Directive, Injector, Input, OnChanges, OnDestroy,
} from '@angular/core';
import { ReplaySubject } from 'rxjs';

import { WidgetConfigInterface } from '@pe/checkout/types';

import { defaultCustomWidgetConfig } from '../../constants';

@Directive()
export class UIBaseComponent implements OnChanges, OnDestroy {

  @Input() forceDefaultStyles = false;
  @Input() config: WidgetConfigInterface = null;

  isSmallSize = false;
  default: WidgetConfigInterface = defaultCustomWidgetConfig();

  protected cdr: ChangeDetectorRef = this.injector.get(ChangeDetectorRef);
  protected debugName = 'noname';
  protected destroyed$: ReplaySubject<boolean> = new ReplaySubject();

  private oldWidth: number = null;

  constructor(protected injector: Injector) {
  }

  ngOnChanges(): void {
    this.onUpdateStyles();
  }

  ngOnDestroy(): void {
    this.destroyed$.next(true);
    this.destroyed$.complete();
  }

  get currentStyles(): any {
    return this.forceDefaultStyles ? this.default.styles : this.config?.styles;
  }

  onUpdateStyles(): void {
    return;
  }

  onElementResized({ contentRect }: ResizeObserverEntry): boolean {
    let result = false;
    if (contentRect.width !== this.oldWidth) {
      this.oldWidth = contentRect.width;
      this.isSmallSize = contentRect.width < 380;
      this.cdr.detectChanges();
      result = true;
    }

    return result;
  }
}
