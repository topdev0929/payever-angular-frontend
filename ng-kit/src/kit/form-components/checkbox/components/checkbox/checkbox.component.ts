import { Component, Input, ViewEncapsulation, OnInit, HostBinding, Injector, EventEmitter, Output } from '@angular/core';
import { MatCheckboxChange } from '@angular/material/checkbox';

import { AbstractFieldComponent } from '../../../../form-core/components/abstract-field';
import { CheckboxSize, CheckboxLabelPosition } from '../../enums';
import { CheckboxChangeEvent } from '../../interfaces';

@Component({
  selector: 'pe-checkbox',
  templateUrl: 'checkbox.component.html',
  encapsulation: ViewEncapsulation.None
})
export class CheckboxComponent extends AbstractFieldComponent implements OnInit {

  @HostBinding('class.pe-checkbox') hostClass: boolean = true;

  @Input('aria-label') ariaLabel: string;
  @Input() indeterminate: boolean;
  @Input() labelPosition: CheckboxLabelPosition = CheckboxLabelPosition.After;
  @Input() label: string;
  @Input() name: string | null;
  @Input() size: CheckboxSize = CheckboxSize.Normal;

  @Output() valueChange: EventEmitter<CheckboxChangeEvent> = new EventEmitter<CheckboxChangeEvent>();
  @Output() labelClick: EventEmitter<MouseEvent> = new EventEmitter<MouseEvent>();

  constructor(protected injector: Injector) {
    super(injector);
  }

  ngOnInit(): void {
    this.labelPosition = this.labelPosition || CheckboxLabelPosition.After;
    this.size = this.size || CheckboxSize.Normal;
  }

  onChanged(event: MatCheckboxChange): void {
    this.valueChange.emit({ checked: event.checked });
  }
}
