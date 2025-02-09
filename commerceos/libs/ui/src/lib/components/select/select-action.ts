import { ChangeDetectionStrategy, Component, HostBinding, HostListener, Input } from '@angular/core';

import { EnvService } from '@pe/common';

import { PebSelectComponent } from './select';
import { SelectService } from './select.service';

@Component({
  // eslint-disable-next-line @angular-eslint/component-selector
  selector: 'peb-select-action',
  template: `<span>{{ label }}</span>`,
  styleUrls: ['./option.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SelectActionComponent {
  isSelected = false;
  isMultiple = false;

  @Input()
  public label: string;

  @HostBinding('class.border') border = true;

  private select: PebSelectComponent;

  @HostBinding('class') classes = `peb-select-option`;

  constructor(
    private envService: EnvService,
    private selectService: SelectService
  ) {
    this.select = this.selectService.getSelect();
  }

  @HostListener('click', ['$event'])
  public onClick(event: UIEvent) {
    event.preventDefault();
    event.stopPropagation();
  }
}
