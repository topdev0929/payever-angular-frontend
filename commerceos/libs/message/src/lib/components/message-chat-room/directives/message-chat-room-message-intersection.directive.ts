import { Directive, ElementRef } from '@angular/core';

@Directive({
  // eslint-disable-next-line @angular-eslint/directive-selector
  selector: '[peChatRoomMessageIntersection]',
})
export class PeChatRoomMessageIntersectionDirective {
  private elementRef: ElementRef;

  constructor(
    elementRef: ElementRef
  ) {
    this.elementRef = elementRef;
  }
}
