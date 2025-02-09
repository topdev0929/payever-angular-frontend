import {
  Component,
  Input,
  Injector,
  Output,
  EventEmitter,
  ViewChild,
  ElementRef,
  ViewEncapsulation,
  OnChanges,
  SimpleChanges, ChangeDetectorRef, Renderer2
} from '@angular/core';
import { timer } from 'rxjs';

import { ColorPickerService, Rgba } from 'ngx-color-picker';

import { AbstractFieldComponent } from '../../../../form-core/components/abstract-field';
import { ColorPickerAlign, ColorPickerFormat } from '../../enums';
import { ColorPickerChangeEvent } from '../../interfaces';

declare const $: any;

export const DEFAULT_COLOR: string = '#ffffff';

@Component({
  selector: 'pe-color-picker',
  styleUrls: ['color-picker.component.scss'],
  templateUrl: 'color-picker.component.html',
  encapsulation: ViewEncapsulation.None
})
export class ColorPickerComponent extends AbstractFieldComponent implements OnChanges {

  @Input() align: ColorPickerAlign = null;
  @Input() alpha: boolean = false;
  @Input() complex: boolean = false;
  @Input() format: ColorPickerFormat = ColorPickerFormat.AUTO;
  @Input() label: string = '';
  @Output() closed: EventEmitter<void> = new EventEmitter<void>();
  @Output() opened: EventEmitter<void> = new EventEmitter<void>();
  @Output() valueChange: EventEmitter<ColorPickerChangeEvent> = new EventEmitter<ColorPickerChangeEvent>();

  @ViewChild('peColorPicker') colorPickerRef: ElementRef;

  readonly ColorPickerFormat = ColorPickerFormat;
  readonly ColorPickerAlign = ColorPickerAlign;

  readonly colors: string[] = [
    '#53A5FB', '#7BE2CF', '#8BD24E', '#F5DF4B', '#E66C54', '#D969A7',
    '#3C76B6', '#55A59D', '#5EAD29', '#EDB930', '#D2391E', '#B63A7A',
    '#244D7E', '#3E7A76', '#386D16', '#EA9629', '#A0280D', '#87285E',
    '#16355D', '#2E5859', '#264B11', '#C1651C', '#701B09', '#581848',
    '#FFFEFF', '#A9A9A9', '#6C6C6C', '#444243', '#000000'
  ];

  isRefreshing: boolean = false;

  private cdr: ChangeDetectorRef = this.injector.get(ChangeDetectorRef);
  private colorPickerService: ColorPickerService = this.injector.get(ColorPickerService);
  private renderer: Renderer2 = this.injector.get(Renderer2);

  constructor(protected injector: Injector) {
    super(injector);
  }

  get cpOutputFormat(): ColorPickerFormat {
    return !this.format || this.format === ColorPickerFormat.AUTO ? ColorPickerFormat.AUTO : ColorPickerFormat.HEX;
  }

  get cpAlphaChannel(): string {
    return this.alpha ? 'always' : 'disabled';
  }

  get cpPosition(): ColorPickerAlign {
    return this.align || ColorPickerAlign.Left;
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes.format || changes.alpha || changes.align || changes.complex) {
      this.isRefreshing = true;
      this.cdr.detectChanges();
      this.isRefreshing = false;
      this.cdr.detectChanges();
    }
  }

  setPickerInputLimits(): void {
    timer(0).subscribe(() => {
      if (this.colorPickerRef && this.colorPickerRef.nativeElement) {
        const colorPicker: any[] = this.colorPickerRef.nativeElement.getElementsByTagName('color-picker');
        if (colorPicker.length) {
          const hexTexts = colorPicker[0].getElementsByClassName('hex-text');
          if (hexTexts.length) {
            const inputs = hexTexts[0].getElementsByTagName('input');
            if (inputs.length) {
              this.renderer.setAttribute(inputs[0], 'maxLength', this.alpha ? '9' : '7');
            }
          }
        }
      }
    });
  }

  colorPickerOpened(): void {
    this.opened.emit();
  }

  colorPickerClosed(): void {
    this.closed.emit();
  }

  colorPickerChanged(color: string): void {
    if (this.cpOutputFormat === ColorPickerFormat.HEX) {
      const rgba = this.hexStringToRgba(color);
      const hsva = this.colorPickerService.rgbaToHsva(rgba);
      color = hsva ? this.colorPickerService.outputFormat(hsva, this.format, this.cpAlphaChannel) : color;
    }

    this.formControl.setValue(color);
    this.valueChange.emit({ value: this.formControl.value });
  }

  initialColor(): string {
    const result: string = this.formControl.value || DEFAULT_COLOR;
    return result.replace(',.', ',0.');
  }

  private hexStringToRgba(hex: string): Rgba {
    hex = hex.replace('#', '');
    const r = hex.substr(0, 2);
    const g = hex.substr(2, 2);
    const b = hex.substr(4, 2);
    const a = hex.substr(6, 2);
    return new Rgba(
      parseInt(r, 16) / 0xFF,
      parseInt(g, 16) / 0xFF,
      parseInt(b, 16) / 0xFF,
      (a === '' ? 0xFF : parseInt(a, 16)) / 0xFF
    );
  }
}
