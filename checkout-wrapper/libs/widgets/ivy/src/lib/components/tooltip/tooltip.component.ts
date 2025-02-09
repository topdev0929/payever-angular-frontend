import { BlockScrollStrategy, Overlay, ViewportRuler } from '@angular/cdk/overlay';
import { ComponentPortal } from '@angular/cdk/portal';
import { ChangeDetectionStrategy, Component, ElementRef } from '@angular/core';

import { TooltipDialogComponent } from '../dialog';

@Component({
  selector: 'tooltip',
  templateUrl: './tooltip.component.html',
  styleUrls: ['./tooltip.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TooltipComponent {

  constructor(
    private elementRef: ElementRef,
    private overlay: Overlay,
    private viewportRuler: ViewportRuler,
  ) {}

  public tooltip(): void {
    const overlayRef = this.overlay.create({
      positionStrategy: this.overlay.position().flexibleConnectedTo(this.elementRef).withPositions([
        {
          originX: 'start',
          originY: 'top',
          overlayX: 'start',
          overlayY: 'bottom',
        },
      ]),
      hasBackdrop: true,
      disposeOnNavigation: true,
      height: '530px',
      width: '440px',
      panelClass: 'tooltip-dialog',
      backdropClass: 'ivy-tooltip-backdrop',
      scrollStrategy: new BlockScrollStrategy(this.viewportRuler, document),
    });

    const componentPortal = new ComponentPortal(TooltipDialogComponent);
    const componentRef = overlayRef.attach(componentPortal);
    componentRef.instance.overlayRef = overlayRef;
    componentRef.hostView.markForCheck();
  }
}
