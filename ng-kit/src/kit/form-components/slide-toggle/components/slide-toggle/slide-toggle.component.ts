import { Component, Input, Injector, Output, EventEmitter, ViewEncapsulation, OnInit, HostBinding } from '@angular/core';

import { MatSlideToggleChange } from '@angular/material/slide-toggle';

import { AbstractFieldComponent } from '../../../../form-core/components/abstract-field';
import { SlideToggleLabelPosition, SlideToggleSize } from '../../enums';
import { SlideToggleChangeEvent } from '../../interfaces';

@Component({
  selector: 'pe-slide-toggle',
  templateUrl: 'slide-toggle.component.html',
  encapsulation: ViewEncapsulation.None
})
export class SlideToggleComponent extends AbstractFieldComponent implements OnInit {

  @Input('aria-label') ariaLabel: string | null;
  @Input('aria-labelledby') ariaLabelledby: string | null;
  @Input() isLightFontWeight: boolean = false;
  @Input() fullWidth: boolean;
  @Input() withoutLeftPadding: boolean;
  @Input() label: string;
  @Input() labelPosition: SlideToggleLabelPosition = SlideToggleLabelPosition.After;
  @Input() size: SlideToggleSize = SlideToggleSize.Default;

  @Output() valueChange: EventEmitter<SlideToggleChangeEvent> = new EventEmitter<SlideToggleChangeEvent>();

  constructor(protected injector: Injector) {
    super(injector);
  }

  ngOnInit(): void {
    this.labelPosition = this.labelPosition || SlideToggleLabelPosition.After;
  }

  onChanged(event: MatSlideToggleChange): void {
    this.valueChange.emit({ checked: event.checked });
  }
}
