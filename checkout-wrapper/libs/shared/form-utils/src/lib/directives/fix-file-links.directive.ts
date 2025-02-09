import { AfterViewChecked, AfterViewInit, Directive, ElementRef } from '@angular/core';

import { LinkFixerService } from '../services';

@Directive({
  selector: '[peFixFileLinks]',
})
export class FixFileLinksDirective implements AfterViewInit, AfterViewChecked {

  private element: HTMLElement;
  private cachedHTML: string;

  constructor(
    protected elementRef: ElementRef,
    private linkFixerService: LinkFixerService
  ) {}

  ngAfterViewInit(): void {
    this.element = this.elementRef.nativeElement;
  }

  ngAfterViewChecked(): void {
    if (this.element.innerHTML !== this.cachedHTML) {
      const links = this.element.querySelectorAll('a');
      links.forEach((link) => {
        link.href = this.linkFixerService.fixLink(link.href);
        link.target = '_blank';
      });
      this.cachedHTML = this.element.innerHTML;
    }
  }
}
