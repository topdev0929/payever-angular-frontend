import { Directive, ElementRef, HostBinding, Input, OnInit, Renderer2 } from '@angular/core';

import { PeDestroyService } from '@pe/common';

@Directive({
  selector: '[peScrollHide]',
  providers: [
    PeDestroyService,
  ],
})
export class ScrollHideDirective implements OnInit {

  @HostBinding('class.data-grid-scroll-container') cssClass = true;

  @Input() hideHorizontalScrollbar = false;

  constructor(
    private elementRef: ElementRef,
    private renderer: Renderer2,
  ) {
  }

  ngOnInit(): void {
    this.renderer.setStyle(this.elementRef.nativeElement, 'overflow-y', `scroll`);
    this.renderer.setStyle(this.elementRef.nativeElement, 'scrollbar-width', `none`);
    if (this.hideHorizontalScrollbar) {
      this.renderer.setStyle(this.elementRef.nativeElement, 'overflow-x', `hidden`);
    }
  }
}
