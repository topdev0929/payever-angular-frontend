import { ChangeDetectionStrategy, Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';

import { CustomElementService } from '@pe/checkout/utils';

export interface TooltipDialogData {
  text: string;
}

@Component({
  selector: 'tooltip-dialog',
  templateUrl: './tooltip-dialog.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TooltipDialogComponent {

  public text = this.data.text;

  constructor(
    protected customElementService: CustomElementService,
    @Inject(MAT_DIALOG_DATA) private data: TooltipDialogData,
  ) {
    (window as any).PayeverStatic?.SvgIconsLoader?.loadIcons(
      ['close-16'],
      null,
      this.customElementService.shadowRoot
    );
  }
}
