import {
  AfterViewInit,
  ChangeDetectorRef,
  Component,
  ElementRef,
  HostListener,
  OnDestroy,
  OnInit,
  ViewChild,
  ViewEncapsulation,
} from '@angular/core';
import { DomSanitizer, SafeStyle } from '@angular/platform-browser';

import { PebColorPickerService } from './color-picker.service';
import { Cmyk, ColorFormats, Hsla, Hsva, Rgba } from './formats';
import { AlphaChannel, detectIE, OutputFormat, SliderDimension, SliderPosition } from './helpers';
import { DialogStyles } from "./dialog.interface";

@Component({
  selector: 'peb-color-picker',
  templateUrl: './color-picker.component.html',
  styleUrls: ['./color-picker.component.css'],
  encapsulation: ViewEncapsulation.None,
})
export class PebColorPickerComponent implements OnInit, OnDestroy, AfterViewInit {
  private isIE10 = false;

  private cmyk: Cmyk;
  private hsva: Hsva;

  private width: number;
  private height: number;

  private cmykColor: string;
  private outputColor: string;
  private initialColor: string;
  private fallbackColor: string;

  private listenerResize: any;
  private listenerMouseDown: any;

  private directiveInstance: any;

  private sliderH: number;
  private sliderDimMax: SliderDimension;
  private directiveElementRef: ElementRef;

  private dialogArrowSize = 10;
  private dialogArrowOffset = 15;

  private dialogInputFields: ColorFormats[] = [
    ColorFormats.HEX,
    ColorFormats.RGBA,
    ColorFormats.HSLA,
    ColorFormats.CMYK,
  ];

  private useRootViewContainer = false;

  public show: boolean;
  public hidden: boolean;

  public top: number;
  public left: number;
  public position: string;

  public format: ColorFormats;
  public slider: SliderPosition;

  public hexText: string;
  public hexAlpha: number;

  public cmykText: Cmyk;
  public hslaText: Hsla;
  public rgbaText: Rgba;

  public arrowTop: number;

  public selectedColor: string;
  public hueSliderColor: string;
  public saturationSliderColor: SafeStyle;
  public alphaSliderColor: string;

  public cpWidth: number;
  public cpHeight: number;

  public cpColorMode: number;

  public cpCmykEnabled: boolean;

  public cpAlphaChannel: AlphaChannel;
  public cpOutputFormat: OutputFormat;

  public cpDisableInput: boolean;
  public cpDialogDisplay: string;

  public cpIgnoredElements: any;

  public cpSaveClickOutside: boolean;
  public cpCloseClickOutside: boolean;

  public cpPosition: string;
  public cpUsePosition: string;
  public cpPositionOffset: number;

  public cpOKButton: boolean;
  public cpOKButtonText: string;
  public cpOKButtonClass: string;

  public cpCancelButton: boolean;
  public cpCancelButtonText: string;
  public cpCancelButtonClass: string;

  public cpPresetLabel: string;
  public cpPresetColors: string[];
  public cpPresetColorsClass: string;
  public cpMaxPresetColorsLength: number;

  public cpPresetEmptyMessage: string;
  public cpPresetEmptyMessageClass: string;

  public cpAddColorButton: boolean;
  public cpAddColorButtonText: string;
  public cpAddColorButtonClass: string;
  public cpRemoveColorButtonClass: string;

  @ViewChild('dialogPopup', { static: true }) dialogElement: ElementRef;

  @ViewChild('hueSlider', { static: true }) hueSlider: ElementRef;
  @ViewChild('alphaSlider', { static: true }) alphaSlider: ElementRef;

  @HostListener('document:keyup.esc', ['$event']) handleEsc(event: any): void {
    if (this.show && this.cpDialogDisplay === 'popup') {
      this.onCancelColor(event);
    }
  }

  @HostListener('document:keyup.enter', ['$event']) handleEnter(event: any): void {
    if (this.show && this.cpDialogDisplay === 'popup') {
      this.onAcceptColor(event);
    }
  }

  constructor(
    private elRef: ElementRef,
    private cdRef: ChangeDetectorRef,
    private service: PebColorPickerService,
    private domSanitizer: DomSanitizer) {
  }

  ngOnInit(): void {
    this.slider = new SliderPosition(0, 0, 0, 0);

    const hueWidth = this.hueSlider.nativeElement.offsetWidth || 140;
    const alphaWidth = this.alphaSlider.nativeElement.offsetWidth || 140;

    this.sliderDimMax = new SliderDimension(hueWidth, this.cpWidth, 230, alphaWidth);

    if (this.cpCmykEnabled) {
      this.format = ColorFormats.CMYK;
    } else if (this.cpOutputFormat === 'rgba') {
      this.format = ColorFormats.RGBA;
    } else if (this.cpOutputFormat === 'hsla') {
      this.format = ColorFormats.HSLA;
    } else {
      this.format = ColorFormats.HEX;
    }

    this.listenerMouseDown = (event: any) => {
      this.onMouseDown(event);
    };
    this.listenerResize = () => {
      this.onResize();
    };

    this.openDialog(this.initialColor, false);
  }

  ngOnDestroy(): void {
    this.closeDialog();
  }

  ngAfterViewInit(): void {
    if (this.cpWidth !== 230 || this.cpDialogDisplay === 'inline') {
      const hueWidth = this.hueSlider.nativeElement.offsetWidth || 140;
      const alphaWidth = this.alphaSlider.nativeElement.offsetWidth || 140;

      this.sliderDimMax = new SliderDimension(hueWidth, this.cpWidth, 230, alphaWidth);

      this.updateColorPicker(false);

      this.cdRef.detectChanges();
    }
  }

  public openDialog(color: any, emit: boolean = true): void {
    this.service.setActive(this);

    if (!this.width) {
      this.cpWidth = this.directiveElementRef.nativeElement.offsetWidth;
    }

    if (!this.height) {
      this.height = 320;
    }

    this.setInitialColor(color);

    this.setColorFromString(color, emit);

    this.openColorPicker();
  }

  public closeDialog(): void {
    this.closeColorPicker();
  }

  public setupDialog(instance: any, elementRef: ElementRef, styles: DialogStyles): void {
    this.setInitialColor(styles.color);

    this.setColorMode(styles.cpColorMode);

    this.isIE10 = detectIE() === 10;

    this.directiveInstance = instance;
    this.directiveElementRef = elementRef;

    this.cpDisableInput = styles.cpDisableInput;

    this.cpCmykEnabled = styles.cpCmykEnabled;
    this.cpAlphaChannel = styles.cpAlphaChannel;
    this.cpOutputFormat = styles.cpOutputFormat;

    this.cpDialogDisplay = styles.cpDialogDisplay;

    this.cpIgnoredElements = styles.cpIgnoredElements;

    this.cpSaveClickOutside = styles.cpSaveClickOutside;
    this.cpCloseClickOutside = styles.cpCloseClickOutside;

    this.useRootViewContainer = styles.cpUseRootViewContainer;

    this.width = this.cpWidth = parseInt(styles.cpWidth, 10);
    this.height = this.cpHeight = parseInt(styles.cpHeight, 10);

    this.cpPosition = styles.cpPosition;
    this.cpPositionOffset = parseInt(styles.cpPositionOffset, 10);

    this.cpOKButton = styles.cpOKButton;
    this.cpOKButtonText = styles.cpOKButtonText;
    this.cpOKButtonClass = styles.cpOKButtonClass;

    this.cpCancelButton = styles.cpCancelButton;
    this.cpCancelButtonText = styles.cpCancelButtonText;
    this.cpCancelButtonClass = styles.cpCancelButtonClass;

    this.fallbackColor = styles.cpFallbackColor || '#fff';

    this.setPresetConfig(styles.cpPresetLabel, styles.cpPresetColors);

    this.cpPresetColorsClass = styles.cpPresetColorsClass;
    this.cpMaxPresetColorsLength = styles.cpMaxPresetColorsLength;
    this.cpPresetEmptyMessage = styles.cpPresetEmptyMessage;
    this.cpPresetEmptyMessageClass = styles.cpPresetEmptyMessageClass;

    this.cpAddColorButton = styles.cpAddColorButton;
    this.cpAddColorButtonText = styles.cpAddColorButtonText;
    this.cpAddColorButtonClass = styles.cpAddColorButtonClass;
    this.cpRemoveColorButtonClass = styles.cpRemoveColorButtonClass;

    if (!styles.cpPositionRelativeToArrow) {
      this.dialogArrowOffset = 0;
    }

    if (styles.cpDialogDisplay === 'inline') {
      this.dialogArrowSize = 0;
      this.dialogArrowOffset = 0;
    }

    if (styles.cpOutputFormat === 'hex' &&
      styles.cpAlphaChannel !== 'always' && styles.cpAlphaChannel !== 'forced') {
      this.cpAlphaChannel = 'disabled';
    }
  }

  public setColorMode(mode: string): void {
    switch (mode.toString().toUpperCase()) {
      case '1':
      case 'C':
      case 'COLOR':
        this.cpColorMode = 1;
        break;
      case '2':
      case 'G':
      case 'GRAYSCALE':
        this.cpColorMode = 2;
        break;
      case '3':
      case 'P':
      case 'PRESETS':
        this.cpColorMode = 3;
        break;
      default:
        this.cpColorMode = 1;
    }
  }

  public setInitialColor(color: any): void {
    this.initialColor = color;
  }

  public setPresetConfig(cpPresetLabel: string, cpPresetColors: string[]): void {
    this.cpPresetLabel = cpPresetLabel;
    this.cpPresetColors = cpPresetColors;
  }

  public setColorFromString(value: string, emit: boolean = true, update: boolean = true): void {
    let hsva: Hsva | null;

    if (this.cpAlphaChannel === 'always' || this.cpAlphaChannel === 'forced') {
      hsva = this.service.stringToHsva(value, true);

      if (!hsva && !this.hsva) {
        hsva = this.service.stringToHsva(value, false);
      }
    } else {
      hsva = this.service.stringToHsva(value, false);
    }

    if (!hsva && !this.hsva) {
      hsva = this.service.stringToHsva(this.fallbackColor, false);
    }

    if (hsva) {
      this.hsva = hsva;

      this.sliderH = this.hsva.h;

      if (this.cpOutputFormat === 'hex' && this.cpAlphaChannel === 'disabled') {
        this.hsva.a = 1;
      }

      this.updateColorPicker(emit, update);
    }
  }

  public onResize(): void {
    if (this.position === 'fixed') {
      this.setDialogPosition();
    } else if (this.cpDialogDisplay !== 'inline') {
      this.closeColorPicker();
    }
  }

  public onDragEnd(slider: string): void {
    this.directiveInstance.sliderDragEnd({ slider, color: this.outputColor });
  }

  public onDragStart(slider: string): void {
    this.directiveInstance.sliderDragStart({ slider, color: this.outputColor });
  }

  public onMouseDown(event: MouseEvent): void {
    if (this.show &&
      !this.isIE10 && this.cpDialogDisplay === 'popup' &&
      event.target !== this.directiveElementRef.nativeElement &&
      !this.isDescendant(this.elRef.nativeElement, event.target) &&
      !this.isDescendant(this.directiveElementRef.nativeElement, event.target) &&
      this.cpIgnoredElements.filter((item: any) => item === event.target).length === 0) {
      if (this.cpSaveClickOutside) {
        this.directiveInstance.colorSelected(this.outputColor);
      } else {
        this.hsva = null;

        this.setColorFromString(this.initialColor, false);

        if (this.cpCmykEnabled) {
          this.directiveInstance.cmykChanged(this.cmykColor);
        }

        this.directiveInstance.colorChanged(this.initialColor);

        this.directiveInstance.colorCanceled();
      }

      if (this.cpCloseClickOutside) {
        this.closeColorPicker();
      }
    }
  }

  public onAcceptColor(event: Event): void {
    event.stopPropagation();

    if (this.outputColor) {
      this.directiveInstance.colorSelected(this.outputColor);
    }

    if (this.cpDialogDisplay === 'popup') {
      this.closeColorPicker();
    }
  }

  public onCancelColor(event: Event): void {
    this.hsva = null;

    event.stopPropagation();

    this.setColorFromString(this.initialColor, true);

    if (this.cpDialogDisplay === 'popup') {
      if (this.cpCmykEnabled) {
        this.directiveInstance.cmykChanged(this.cmykColor);
      }

      this.directiveInstance.colorChanged(this.initialColor, true);

      this.closeColorPicker();
    }

    this.directiveInstance.colorCanceled();
  }

  public onFormatToggle(change: number): void {
    const availableFormats = this.dialogInputFields.length -
      (this.cpCmykEnabled ? 0 : 1);

    const nextFormat = ((this.dialogInputFields.indexOf(this.format) + change) %
      availableFormats + availableFormats) % availableFormats;

    this.format = this.dialogInputFields[nextFormat];
  }

  public onColorChange(value: { s: number, v: number, rgX: number, rgY: number }): void {
    this.hsva.s = value.s / value.rgX;
    this.hsva.v = value.v / value.rgY;

    this.updateColorPicker();

    this.directiveInstance.sliderChanged({
      slider: 'lightness',
      value: this.hsva.v,
      color: this.outputColor,
    });

    this.directiveInstance.sliderChanged({
      slider: 'saturation',
      value: this.hsva.s,
      color: this.outputColor,
    });
  }

  public onHueChange(value: { v: number, rgX: number }): void {
    this.hsva.h = value.v / value.rgX;
    this.sliderH = this.hsva.h;

    this.updateColorPicker();

    this.directiveInstance.sliderChanged({
      slider: 'hue',
      value: this.hsva.h,
      color: this.outputColor,
    });
  }

  public onSaturationChange(value: { v: number, rgX: number }): void {
    this.hsva.s = value.v / value.rgX;

    this.updateColorPicker();

    this.directiveInstance.sliderChanged({
      slider: 'saturation',
      value: this.hsva.s,
      color: this.outputColor,
    });
  }

  public onValueChange(value: { v: number, rgX: number }): void {
    this.hsva.v = value.v / value.rgX;

    this.updateColorPicker();

    this.directiveInstance.sliderChanged({
      slider: 'value',
      value: this.hsva.v,
      color: this.outputColor,
    });
  }

  public onAlphaChange(value: { v: number, rgX: number }): void {
    this.hsva.a = value.v / value.rgX;

    this.updateColorPicker();

    this.directiveInstance.sliderChanged({
      slider: 'alpha',
      value: this.hsva.a,
      color: this.outputColor,
    });
  }

  public onHexInput(hex: string | null): void {
    if (hex === null) {
      this.updateColorPicker();
    } else {
      let value = hex;
      if (value && value[0] !== '#') {
        value = `#${value}`;
      }

      let validHex = /^#([a-f0-9]{3}|[a-f0-9]{6})$/gi;

      if (this.cpAlphaChannel === 'always') {
        validHex = /^#([a-f0-9]{3}|[a-f0-9]{6}|[a-f0-9]{8})$/gi;
      }

      const valid = validHex.test(value);

      if (valid) {
        if (value.length < 5) {
          value = `#${value.substring(1)
            .split('')
            .map(c => c + c)
            .join('')}`;
        }

        if (this.cpAlphaChannel === 'forced') {
          value += Math.round(this.hsva.a * 255).toString(16);
        }

        this.setColorFromString(value, true, false);
      }

      this.directiveInstance.inputChanged({
        valid,
        value,
        input: 'hex',
        color: this.outputColor,
      });
    }
  }

  public onRedInput(value: { v: number, rg: number }): void {
    const rgba = this.service.hsvaToRgba(this.hsva);

    const valid = !isNaN(value.v) && value.v >= 0 && value.v <= value.rg;

    if (valid) {
      rgba.r = value.v / value.rg;

      this.hsva = this.service.rgbaToHsva(rgba);

      this.sliderH = this.hsva.h;

      this.updateColorPicker();
    }

    this.directiveInstance.inputChanged({
      valid,
      input: 'red',
      value: rgba.r,
      color: this.outputColor,
    });
  }

  public onBlueInput(value: { v: number, rg: number }): void {
    const rgba = this.service.hsvaToRgba(this.hsva);

    const valid = !isNaN(value.v) && value.v >= 0 && value.v <= value.rg;

    if (valid) {
      rgba.b = value.v / value.rg;

      this.hsva = this.service.rgbaToHsva(rgba);

      this.sliderH = this.hsva.h;

      this.updateColorPicker();
    }

    this.directiveInstance.inputChanged({
      valid,
      input: 'blue',
      value: rgba.b,
      color: this.outputColor,
    });
  }

  public onGreenInput(value: { v: number, rg: number }): void {
    const rgba = this.service.hsvaToRgba(this.hsva);

    const valid = !isNaN(value.v) && value.v >= 0 && value.v <= value.rg;

    if (valid) {
      rgba.g = value.v / value.rg;

      this.hsva = this.service.rgbaToHsva(rgba);

      this.sliderH = this.hsva.h;

      this.updateColorPicker();
    }

    this.directiveInstance.inputChanged({
      valid,
      input: 'green',
      value: rgba.g,
      color: this.outputColor,
    });
  }

  public onHueInput(value: { v: number, rg: number }) {
    const valid = !isNaN(value.v) && value.v >= 0 && value.v <= value.rg;

    if (valid) {
      this.hsva.h = value.v / value.rg;

      this.sliderH = this.hsva.h;

      this.updateColorPicker();
    }

    this.directiveInstance.inputChanged({
      valid,
      input: 'hue',
      value: this.hsva.h,
      color: this.outputColor,
    });
  }

  public onValueInput(value: { v: number, rg: number }): void {
    const valid = !isNaN(value.v) && value.v >= 0 && value.v <= value.rg;

    if (valid) {
      this.hsva.v = value.v / value.rg;

      this.updateColorPicker();
    }

    this.directiveInstance.inputChanged({
      valid,
      input: 'value',
      value: this.hsva.v,
      color: this.outputColor,
    });
  }

  public onAlphaInput(value: { v: number, rg: number }): void {
    value.v = value.v / 100;

    const valid = !isNaN(value.v) && value.v >= 0 && value.v <= value.rg;

    if (valid) {
      this.hsva.a = value.v / value.rg;

      this.updateColorPicker();
    }

    this.directiveInstance.inputChanged({
      valid,
      input: 'alpha',
      value: this.hsva.a,
      color: this.outputColor,
    });
  }

  public onLightnessInput(value: { v: number, rg: number }): void {
    const hsla = this.service.hsva2hsla(this.hsva);

    const valid = !isNaN(value.v) && value.v >= 0 && value.v <= value.rg;

    if (valid) {
      hsla.l = value.v / value.rg;

      this.hsva = this.service.hsla2hsva(hsla);

      this.sliderH = this.hsva.h;

      this.updateColorPicker();
    }

    this.directiveInstance.inputChanged({
      valid,
      input: 'lightness',
      value: hsla.l,
      color: this.outputColor,
    });
  }

  public onSaturationInput(value: { v: number, rg: number }): void {
    const hsla = this.service.hsva2hsla(this.hsva);

    const valid = !isNaN(value.v) && value.v >= 0 && value.v <= value.rg;

    if (valid) {
      hsla.s = value.v / value.rg;

      this.hsva = this.service.hsla2hsva(hsla);

      this.sliderH = this.hsva.h;

      this.updateColorPicker();
    }

    this.directiveInstance.inputChanged({
      valid,
      input: 'saturation',
      value: hsla.s,
      color: this.outputColor,
    });
  }

  public onCyanInput(value: { v: number, rg: number }): void {
    const valid = !isNaN(value.v) && value.v >= 0 && value.v <= value.rg;

    if (valid) {
      this.cmyk.c = value.v;

      this.updateColorPicker(false, true, true);
    }

    this.directiveInstance.inputChanged({
      input: 'cyan',
      valid: true,
      value: this.cmyk.c,
      color: this.outputColor,
    });
  }

  public onMagentaInput(value: { v: number, rg: number }): void {
    const valid = !isNaN(value.v) && value.v >= 0 && value.v <= value.rg;

    if (valid) {
      this.cmyk.m = value.v;

      this.updateColorPicker(false, true, true);
    }

    this.directiveInstance.inputChanged({
      input: 'magenta',
      valid: true,
      value: this.cmyk.m,
      color: this.outputColor,
    });
  }

  public onYellowInput(value: { v: number, rg: number }): void {
    const valid = !isNaN(value.v) && value.v >= 0 && value.v <= value.rg;

    if (valid) {
      this.cmyk.y = value.v;

      this.updateColorPicker(false, true, true);
    }

    this.directiveInstance.inputChanged({
      input: 'yellow',
      valid: true,
      value: this.cmyk.y,
      color: this.outputColor,
    });
  }

  public onBlackInput(value: { v: number, rg: number }): void {
    const valid = !isNaN(value.v) && value.v >= 0 && value.v <= value.rg;

    if (valid) {
      this.cmyk.k = value.v;

      this.updateColorPicker(false, true, true);
    }

    this.directiveInstance.inputChanged({
      input: 'black',
      valid: true,
      value: this.cmyk.k,
      color: this.outputColor,
    });
  }

  public onAddPresetColor(event: any, value: string): void {
    event.stopPropagation();

    if (!this.cpPresetColors.filter(color => color === value).length) {
      this.cpPresetColors = this.cpPresetColors.concat(value);

      this.directiveInstance.presetColorsChanged(this.cpPresetColors);
    }
  }

  public onRemovePresetColor(event: any, value: string): void {
    event.stopPropagation();

    this.cpPresetColors = this.cpPresetColors.filter(color => color !== value);

    this.directiveInstance.presetColorsChanged(this.cpPresetColors);
  }

  private openColorPicker(): void {
    if (!this.show) {
      this.show = true;
      this.hidden = true;

      setTimeout(() => {
        this.hidden = false;

        this.setDialogPosition();

        this.cdRef.detectChanges();
      }, 0);

      this.directiveInstance.stateChanged(true);

      if (!this.isIE10) {
        document.addEventListener('mousedown', this.listenerMouseDown);
        document.addEventListener('touchstart', this.listenerMouseDown);
      }

      window.addEventListener('resize', this.listenerResize);
    }
  }

  private closeColorPicker(): void {
    if (this.show) {
      this.show = false;

      this.directiveInstance.stateChanged(false);

      if (!this.isIE10) {
        document.removeEventListener('mousedown', this.listenerMouseDown);
        document.removeEventListener('touchstart', this.listenerMouseDown);
      }

      window.removeEventListener('resize', this.listenerResize);

      if (!(this.cdRef as any).destroyed) {
        this.cdRef.detectChanges();
      }
    }
  }

  private updateColorPicker(emit: boolean = true, update: boolean = true, cmykInput: boolean = false): void {
    if (this.sliderDimMax) {
      if (this.cpColorMode === 2) {
        this.hsva.s = 0;
      }

      let hue: Rgba;
      let hsla: Hsla;
      let rgba: Rgba;

      const lastOutput = this.outputColor;

      hsla = this.service.hsva2hsla(this.hsva);

      if (!this.cpCmykEnabled) {
        rgba = this.service.denormalizeRGBA(this.service.hsvaToRgba(this.hsva));
      } else {
        if (!cmykInput) {
          rgba = this.service.hsvaToRgba(this.hsva);

          this.cmyk = this.service.denormalizeCMYK(this.service.rgbaToCmyk(rgba));
        } else {
          rgba = this.service.cmykToRgb(this.service.normalizeCMYK(this.cmyk));

          this.hsva = this.service.rgbaToHsva(rgba);
        }

        rgba = this.service.denormalizeRGBA(rgba);

        this.sliderH = this.hsva.h;
      }

      hue = this.service.denormalizeRGBA(this.service.hsvaToRgba(new Hsva(this.sliderH || this.hsva.h, 1, 1, 1)));

      if (update) {
        this.hslaText = new Hsla(Math.round(hsla.h * 360), Math.round(hsla.s * 100), Math.round(hsla.l * 100),
          Math.round(hsla.a * 100) / 100);

        this.rgbaText = new Rgba(rgba.r, rgba.g, rgba.b, Math.round(rgba.a * 100) / 100);

        if (this.cpCmykEnabled) {
          this.cmykText = new Cmyk(this.cmyk.c, this.cmyk.m, this.cmyk.y, this.cmyk.k,
            Math.round(this.cmyk.a * 100) / 100);
        }

        const allowHex8 = this.cpAlphaChannel === 'always';

        this.hexText = this.service.rgbaToHex(rgba, allowHex8);
        this.hexAlpha = this.rgbaText.a;
      }

      if (this.cpOutputFormat === 'auto') {
        if (this.format !== ColorFormats.RGBA && this.format !== ColorFormats.CMYK) {
          if (this.hsva.a < 1) {
            this.format = this.hsva.a < 1 ? ColorFormats.RGBA : ColorFormats.HEX;
          }
        }
      }

      this.hueSliderColor = `rgb(${hue.r},${hue.g},${hue.b})`;
      this.saturationSliderColor = this.domSanitizer.bypassSecurityTrustStyle(`
        linear-gradient(
          90deg,
          hsla(${hsla.h * 360}, 0%, ${hsla.l * 100}%, 1) 0%,
          hsla(${hsla.h * 360}, 100%, ${hsla.l * 100}%, 1) 100%
        )
      `); // TODO: Need fixed

      this.alphaSliderColor = `rgb(${rgba.r},${rgba.g},${rgba.b})`;

      this.outputColor = this.service.outputFormat(this.hsva, this.cpOutputFormat, this.cpAlphaChannel);
      this.selectedColor = this.service.outputFormat(this.hsva, 'rgba', null);

      if (this.format !== ColorFormats.CMYK) {
        this.cmykColor = '';
      } else if (this.cpAlphaChannel === 'always' || this.cpAlphaChannel === 'enabled' ||
        this.cpAlphaChannel === 'forced') {
        const alpha = Math.round(this.cmyk.a * 100) / 100;

        this.cmykColor = `cmyka(${this.cmyk.c},${this.cmyk.m},${this.cmyk.y},${this.cmyk.k},${alpha})`;
      } else {
        this.cmykColor = `cmyk(${this.cmyk.c},${this.cmyk.m},${this.cmyk.y},${this.cmyk.k})`;
      }

      this.slider = new SliderPosition(
        (this.sliderH || this.hsva.h) * this.sliderDimMax.h - 8,
        this.hsva.s * this.sliderDimMax.s - 8,
        (1 - this.hsva.v) * this.sliderDimMax.v - 8,
        this.hsva.a * this.sliderDimMax.a - 8,
      );

      if (emit && lastOutput !== this.outputColor) {
        if (this.cpCmykEnabled) {
          this.directiveInstance.cmykChanged(this.cmykColor);
        }

        this.directiveInstance.colorChanged(this.outputColor);
      }
    }
  }

  private setDialogPosition(): void {
    if (this.cpDialogDisplay === 'inline') {
      this.position = 'relative';
    } else {
      let position = 'static';
      let transform = '';
      let style;
      let parentNode: any = null;
      let transformNode: any = null;

      let node = this.directiveElementRef.nativeElement.parentNode;

      const dialogHeight = this.dialogElement.nativeElement.offsetHeight;

      while (node !== null && node.tagName !== 'HTML') {
        style = window.getComputedStyle(node);
        position = style.getPropertyValue('position');
        transform = style.getPropertyValue('transform');

        if (position !== 'static' && parentNode === null) {
          parentNode = node;
        }

        if (transform && transform !== 'none' && transformNode === null) {
          transformNode = node;
        }

        if (position === 'fixed') {
          parentNode = transformNode;

          break;
        }

        node = node.parentNode;
      }

      const boxDirective = this.createDialogBox(this.directiveElementRef.nativeElement, position !== 'fixed');

      if (this.useRootViewContainer || position === 'fixed' &&
        (!parentNode || parentNode instanceof HTMLUnknownElement)) {
        this.top = boxDirective.top;
        this.left = boxDirective.left;
      } else {
        if (parentNode === null) {
          parentNode = node;
        }

        const boxParent = this.createDialogBox(parentNode, position !== 'fixed');

        this.top = boxDirective.top - boxParent.top;
        this.left = boxDirective.left - boxParent.left;
      }

      if (position === 'fixed') {
        this.position = 'fixed';
      }

      let usePosition = this.cpPosition;

      if (this.cpPosition === 'auto') {
        let usePositionX = 'right';
        let usePositionY = 'bottom';

        const winWidth = Math.max(document.documentElement.clientWidth, window.innerWidth || 0);
        const winHeight = Math.max(document.documentElement.clientHeight, window.innerHeight || 0);

        if (this.left + this.cpWidth > winWidth) {
          usePositionX = 'left';
        }

        if (this.top + dialogHeight > winHeight) {
          usePositionY = 'top';
        }

        usePosition = `${usePositionX}-${usePositionY}`;
      }

      this.cpUsePosition = usePosition;

      if (usePosition === 'top') {
        this.arrowTop = dialogHeight - 1;

        this.top -= dialogHeight + this.dialogArrowSize;
        this.left += this.cpPositionOffset / 100 * boxDirective.width - this.dialogArrowOffset;
      } else if (usePosition === 'bottom') {
        this.top += boxDirective.height + this.dialogArrowSize;
        this.left += this.cpPositionOffset / 100 * boxDirective.width - this.dialogArrowOffset;
      } else if (usePosition === 'top-left' || usePosition === 'left-top') {
        this.top -= dialogHeight - boxDirective.height + boxDirective.height * this.cpPositionOffset / 100;
        this.left -= this.cpWidth + this.dialogArrowSize - 2 - this.dialogArrowOffset;
      } else if (usePosition === 'top-right' || usePosition === 'right-top') {
        this.top -= dialogHeight - boxDirective.height + boxDirective.height * this.cpPositionOffset / 100;
        this.left += boxDirective.width + this.dialogArrowSize - 2 - this.dialogArrowOffset;
      } else if (usePosition === 'left' || usePosition === 'bottom-left' || usePosition === 'left-bottom') {
        this.top += boxDirective.height * this.cpPositionOffset / 100 - this.dialogArrowOffset;
        this.left -= this.cpWidth + this.dialogArrowSize - 2;
      } else {
        this.top += boxDirective.height * this.cpPositionOffset / 100 - this.dialogArrowOffset;
        this.left += boxDirective.width + this.dialogArrowSize - 2;
      }
    }
  }

  private isDescendant(parent: any, child: any): boolean {
    let node: any = child.parentNode;

    while (node !== null) {
      if (node === parent) {
        return true;
      }

      node = node.parentNode;
    }

    return false;
  }

  private createDialogBox(element: any, offset: boolean): any {
    return {
      top: element.getBoundingClientRect().top + (offset ? window.pageYOffset : 0),
      left: element.getBoundingClientRect().left + (offset ? window.pageXOffset : 0),
      width: element.offsetWidth,
      height: element.offsetHeight,
    };
  }
}
