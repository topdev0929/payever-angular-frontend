import { OverlayRef } from '@angular/cdk/overlay';
import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';

@Component({
  selector: 'tooltip-dialog',
  templateUrl: './dialog.component.html',
  styleUrls: ['./dialog.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.ShadowDom,
})
export class TooltipDialogComponent {

  public overlayRef: OverlayRef;

  public readonly translations = {
    title: $localize `:@@ivy-finexp-widget.tooltip.title:Pay via online banking and plant trees for free`,
    text: {
      title: $localize `:@@ivy-finexp-widget.tooltip.text.title:How does it work?`,
      message: $localize `:@@ivy-finexp-widget.tooltip.text.message:Simply pay directly via online banking at your bank and we will plant a tree for you free of charge.`,
    },
    logo: {
      poweredBy: $localize `:@@ivy-finexp-widget.tooltip.logo.poweredBy:Powered by`,
    },
  };

  public closeTooltip(): void {
    this.overlayRef.dispose();
    this.overlayRef.backdropElement.remove();
  }
}
