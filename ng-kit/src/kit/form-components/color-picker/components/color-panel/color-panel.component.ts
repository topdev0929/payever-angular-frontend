import {
  Component,
  Injector,
  Input,
  Output,
  EventEmitter,
  AfterViewInit,
  ViewEncapsulation
} from '@angular/core';

import { AbstractFieldComponent } from '../../../../form-core/components/abstract-field';
import { ColorPickerChangeEvent } from '../../interfaces';
import { ColorPickerFormat } from '../../enums';

@Component({
  selector: 'pe-color-panel',
  styleUrls: ['color-panel.component.scss'],
  templateUrl: 'color-panel.component.html',
  encapsulation: ViewEncapsulation.None
})
export class ColorPanelComponent extends AbstractFieldComponent implements AfterViewInit {

  @Input() format: ColorPickerFormat = ColorPickerFormat.HEX;
  @Output() close: EventEmitter<void> = new EventEmitter<void>();
  @Output() valueChange: EventEmitter<ColorPickerChangeEvent> = new EventEmitter<ColorPickerChangeEvent>();

  private hexParsingRE: RegExp = /^#([A-Fa-f0-9]{3}){1,2}$/i;

  colors: string[] = ['#3AA3FF', '#6FD838', '#E61D06', '#F2B900', '#E75FA6', '#000000'];

  constructor(protected injector: Injector) {
    super(injector);
  }
  
  onColorChosen(color: string) {
    if (this.format === ColorPickerFormat.RGBA) {
      color = this.hexToRgbA(color);
    }

    this.formControl.setValue(color);
    this.valueChange.emit({ value: this.formControl.value });
  }

  private hexToRgbA(hex: string): string {
    let c: any;
    if (this.hexParsingRE.test(hex)) {
      c = hex.substring(1).split('');

      if (c.length === 3) {
        c = [c[0], c[0], c[1], c[1], c[2], c[2]];
      }
      c = `0x${c.join('')}`;

      return `rgba(${[(c >> 16) & 255, (c >> 8) & 255, c &255].join(',')},1)`;
    }
    return hex;
  }  
}
