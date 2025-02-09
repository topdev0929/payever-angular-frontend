import { Component, EventEmitter, Input, Output } from '@angular/core';

import { SelectOption } from '@pe/builder/core';
import { PeDestroyService } from '@pe/common';

@Component({
  selector: 'peb-select-option-list',
  templateUrl: 'option-list.component.html',
  styleUrls: ['./option-list.component.scss'],
  providers: [
    PeDestroyService,
  ],
})
export class PebSelectOptionListComponent {

  @Input() active: any;
  @Input() options: SelectOption[] | SelectOption[][];
  @Output() selected = new EventEmitter<string>();

  constructor(
    public destroy$: PeDestroyService
  ) {
  }

  isGroup(option): boolean {
    return Array.isArray(option);
  }

  isSelected(value): boolean {
    return Array.isArray(this.active) ? this.active.some(o => o === value) : this.active === value;
  }
}
