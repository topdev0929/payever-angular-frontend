import { Component, Input, Output, EventEmitter, ViewEncapsulation, OnInit, HostBinding, Injector } from '@angular/core';
import { MatRadioChange } from '@angular/material/radio';

import { AbstractFieldComponent } from '../../../../form-core/components/abstract-field';
import { RadioGroupLabelPosition, RadioGroupOrientation } from '../../enums';
import { RadioChangeEvent, RadioButtonInterface } from '../../interfaces';

@Component({
  selector: 'pe-radio-group',
  templateUrl: 'radio-group.component.html',
  encapsulation: ViewEncapsulation.None
})
export class RadioGroupComponent extends AbstractFieldComponent implements OnInit {

  @HostBinding('class.pe-radio') hostClass: boolean = true;

  @Input() radioButtons: RadioButtonInterface[];
  @Input() labelPosition: RadioGroupLabelPosition = RadioGroupLabelPosition.After;
  @Input() orientation: RadioGroupOrientation = RadioGroupOrientation.Horizontal;

  @Output() valueChange: EventEmitter<RadioChangeEvent> = new EventEmitter<RadioChangeEvent>();

  constructor(protected injector: Injector) {
    super(injector);
  }

  ngOnInit(): void {
    this.labelPosition = this.labelPosition || RadioGroupLabelPosition.After;
    this.orientation = this.orientation || RadioGroupOrientation.Horizontal;
  }

  onChanged(change: MatRadioChange): void {
    this.valueChange.emit({ value: change.value });
  }

}
