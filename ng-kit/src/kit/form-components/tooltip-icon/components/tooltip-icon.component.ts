import { Component, Input, HostBinding } from '@angular/core';

import { TooltipIconInterface } from '../../../form-core/interfaces/form-scheme.interface';
import { TooltipPosition } from '../../../tooltip/src/types';
import { DialogConfigPresetName, DialogService } from '../../../dialog';
import { TooltipDialogComponent } from './dialog.component';

@Component({
  selector: 'pe-tooltip-icon',
  templateUrl: './tooltip-icon.component.html'
})
export class TooltipIconComponent {

  @HostBinding('class.tooltip-icon') hostClass: boolean = true;

  @Input() config: TooltipIconInterface;

  constructor(private dialogService: DialogService) {
  }

  get tooltipPosition(): TooltipPosition {
    return this.config.tooltipPosition ? this.config.tooltipPosition : 'after';
  }

  openDialog(): void {
    this.dialogService.open(TooltipDialogComponent, DialogConfigPresetName.Default, {
      text: this.config.tooltipMessage
    });
  }
}
