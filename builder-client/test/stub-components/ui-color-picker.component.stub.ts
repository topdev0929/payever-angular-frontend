import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'ui-color-picker',
  template: ''
})
export class UiColorPickerStubComponent {
  @Input() color: any;
  @Input() align: 'left' | 'right';
  @Output() colorChange: EventEmitter<void> = new EventEmitter();
  @Output() close: EventEmitter<void> = new EventEmitter();
}
