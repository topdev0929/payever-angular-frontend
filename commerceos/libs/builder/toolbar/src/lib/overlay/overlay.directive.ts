import { Overlay, OverlayConfig, OverlayRef } from '@angular/cdk/overlay';
import { ComponentPortal } from '@angular/cdk/portal';
import { Directive, ElementRef, HostListener, Injector, Input, TemplateRef, ViewContainerRef } from '@angular/core';
import { take, tap } from 'rxjs/operators';

import { OVERLAY_POSITIONS } from '@pe/builder/core';

import { PebOverlayComponent } from './overlay.component';


@Directive({
  selector: '[pebOverlay]',
})
export class PebOverlayTriggerDirective {

  @Input('pebOverlay') template: TemplateRef<any> | undefined;

  private overlayRef: OverlayRef | undefined;

  @HostListener('click') open() {
    if (this.template && !this.overlayRef) {
      const config = this.getOverlayConfig();
      this.overlayRef = this.overlay.create(config);

      this.overlayRef.backdropClick().pipe(
        take(1),
        tap(() => this.close()),
      ).subscribe();

      const injector = Injector.create(
        {
          providers: [
            {
              provide: PebOverlayTriggerDirective,
              useValue: this,
            },
          ],
          parent: this.injector,
        });

      const componentRef = this.overlayRef.attach(
        new ComponentPortal(PebOverlayComponent, this.viewContainerRef, injector)
      );
      componentRef.instance.template = this.template;
    }
  }

  constructor(
    private readonly overlay: Overlay,
    private readonly elementRef: ElementRef<HTMLElement>,
    private readonly viewContainerRef: ViewContainerRef,
    private readonly injector: Injector,
  ) {
  }

  close() {
    if (this.overlayRef) {
      this.overlayRef.dispose();
      this.overlayRef = undefined;
    }
  }

  private getOverlayConfig(): OverlayConfig {
    return new OverlayConfig({
      positionStrategy: this.overlay
        .position()
        .flexibleConnectedTo(this.elementRef)
        .withViewportMargin(10)
        .withPositions(OVERLAY_POSITIONS),
      scrollStrategy: this.overlay.scrollStrategies.reposition(),
      hasBackdrop: true,
    });
  }
}
