import { Component, ElementRef, Input, TemplateRef } from '@angular/core';

import { PebOverlayTriggerDirective } from './overlay.directive';
import { PebOverlayService } from './overlay.service';

@Component({
  template: `<ng-container *ngTemplateOutlet="template"></ng-container>`,
})
export class PebOverlayComponent {

  @Input() template: TemplateRef<any> | undefined;

  constructor(
    private readonly directive: PebOverlayTriggerDirective,
    private readonly elementRef: ElementRef<HTMLElement>,
    private readonly overlayService: PebOverlayService,
  ) {
    this.overlayService.set(this.elementRef.nativeElement, this.directive);
  }
}
