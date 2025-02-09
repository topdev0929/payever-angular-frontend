import { Directive, ElementRef, HostListener } from '@angular/core';

import { PebOverlayService } from './overlay.service';


@Directive({
  selector: '[pebOverlayClose]',
})
export class PebOverlayCloseDirective {

  constructor(
    private readonly elementRef: ElementRef<HTMLElement>,
    private readonly overlayService: PebOverlayService,
  ) {
  }

  @HostListener('click') toggleOverlay() {
    let elm = this.elementRef.nativeElement;
    while (elm.parentNode && !this.overlayService.has(elm)) {
      elm = elm.parentNode as HTMLElement;
    }

    const overlay = this.overlayService.get(elm);
    if (overlay) {
      overlay.close();
      this.overlayService.delete(elm);
    }
  }
}
