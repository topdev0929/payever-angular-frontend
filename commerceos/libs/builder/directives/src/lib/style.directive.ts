import { Directive, ElementRef, Input } from '@angular/core';

import { PebCss } from '@pe/builder/core';
import { getInlineStyle } from '@pe/builder/render-utils';


// TODO: remove inline style once found more appropriate solution (to support Safari)
@Directive({
  selector: '[pebStyle]',
})
export class PebStyleDirective {
  @Input() set pebStyle(styles: { [key: string]: string }) {
    this.setElementStyle(styles);
  }

  constructor(private elmRef: ElementRef<HTMLElement>) { }

  private setElementStyle(value: PebCss | undefined): void {
    if (!value) {
      return;
    }

    this.elmRef.nativeElement.setAttribute('style', getInlineStyle(value));
  }
}
