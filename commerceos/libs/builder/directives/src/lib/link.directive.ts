import { Directive, ElementRef, Input } from '@angular/core';

import { isAnchorLink, isExternalUrl, isInternalPage, PebLink } from '@pe/builder/core';


@Directive({
  selector: '[pebLink]',
})
export class PebLinkDirective {
  @Input() set pebLink(link: PebLink) {
    this.setElementLinks(link);
  }

  constructor(private elmRef: ElementRef<HTMLElement>) {
  }

  private setElementLinks(link: PebLink) {
    if (isExternalUrl(link) && link.url) {
      this.elmRef.nativeElement.setAttribute('href', link.url);
      this.elmRef.nativeElement.setAttribute('target', link.target ?? '_blank');
    }
    else if (isInternalPage(link) && link.url) {
      this.elmRef.nativeElement.setAttribute('href', link.url);
    }
    else if (isAnchorLink(link) && link.fragment) {
      this.elmRef.nativeElement.setAttribute('href', `/#${link.fragment}`);
    }
  }
}
