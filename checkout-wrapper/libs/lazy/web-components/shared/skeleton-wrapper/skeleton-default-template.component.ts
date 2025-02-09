import { ChangeDetectionStrategy, Component, ElementRef } from '@angular/core';

/**
 * This is helper component, because we can't import skeleton/default.html file directly
 * For this reason we have to wrap it into component.
 */
@Component({
  changeDetection: ChangeDetectionStrategy.Default,
  selector: 'checkout-wrapper-skeleton-default-template',
  templateUrl: '../../skeleton/default.html',
})
export class SkeletonDefaultTemplateComponent {

  constructor(protected elRef: ElementRef) {
    this.elRef = elRef;
  }

  getHtmlContent() {
    return this.elRef.nativeElement.innerHTML;
  }
}
