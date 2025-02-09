import { ChangeDetectionStrategy, Component, ElementRef, EventEmitter, Optional, Output, Self } from '@angular/core';
import { ControlValueAccessor, FormControl, FormGroup, NgControl } from '@angular/forms';
import { merge, Observable, ReplaySubject } from 'rxjs';
import { map, scan, shareReplay, startWith, switchMap, tap } from 'rxjs/operators';

import { HSVA, hsvaToRgba, rgbaToHsva, stringToRgba } from '@pe/builder/color-utils';
import { RGB, RGBA, isRGBA } from '@pe/builder/core';

@Component({
  selector: 'peb-picker',
  template: `
    <div [formGroup]="form" *ngIf="hsv$ | async as hsv" (change)="onValueChange()">
      <peb-hsva-picker formControlName="hsva" class="hsva-picker"></peb-hsva-picker>
      <div class="controls">
        <peb-range-input
          formControlName="hue"
          class="hue hanging-slider-thumb"
          [min]="0"
          [max]="360"
          [isDynamicColor]="true"
          [style.--filled]="'transparent'"
          [style]="hsv.hue"
        ></peb-range-input>
        <peb-range-input
          class="hanging-slider-thumb"
          formControlName="saturation"
          [min]="0"
          [max]="100"
          [isDynamicColor]="true"
          [style.--filled]="'transparent'"
          [style]="hsv.saturation"
        ></peb-range-input>
        <peb-range-input
          class="hanging-slider-thumb"
          formControlName="value"
          [min]="0"
          [max]="100"
          [isDynamicColor]="true"
          [style.--filled]="'transparent'"
          [style]="hsv.value"
        ></peb-range-input>
      </div>
      <div class="form-row opacity">
        <label class="form-row-label">{{ 'builder-app.styles.opacity' | translate }}</label>
        <div class="combined-input-range">
          <peb-range-input formControlName="alpha" [min]="0" [max]="100"></peb-range-input>
          <peb-number-input formControlName="alpha" [min]="0" [max]="100" units="%"></peb-number-input>
        </div>
      </div>
      <div class="form-row">
        <div class="rgba">
          {{ 'builder-app.color.hex' | translate }}
          <peb-hex-input formControlName="hex" class="hex-input"></peb-hex-input>
          <peb-number-input formControlName="red" [min]="0" [max]="255"></peb-number-input>
          <peb-number-input formControlName="green" [min]="0" [max]="255"></peb-number-input>
          <peb-number-input formControlName="blue" [min]="0" [max]="255"></peb-number-input>
        </div>
      </div>
    </div>
  `,
  styleUrls: ['./picker.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PebPickerComponent implements ControlValueAccessor {

  // eslint-disable-next-line @angular-eslint/no-output-rename, @angular-eslint/no-output-native
  @Output('change') changeOn = new EventEmitter<void>();

  form = new FormGroup({
    hsva: new FormControl(),
    hue: new FormControl(),
    saturation: new FormControl(),
    value: new FormControl(),
    alpha: new FormControl(),
    hex: new FormControl(),
    red: new FormControl(),
    green: new FormControl(),
    blue: new FormControl(),
  });

  onChange: (value: RGB | RGBA) => void;
  onTouch: () => void;

  rgbaValue$ = new ReplaySubject<RGBA>(1);

  valueChanges$ = this.rgbaValue$.pipe(
    map(rgba => ({ hsva: rgbaToHsva(rgba) })),
    switchMap(initialValue => merge(
      this.form.controls.hsva.valueChanges.pipe(map(hsva => ({ hsva }))),
      this.form.controls.hue.valueChanges.pipe(map(hue => ({ hsva: { h: hue } }))),
      this.form.controls.saturation.valueChanges.pipe(map(saturation => ({ hsva: { s: saturation } }))),
      this.form.controls.value.valueChanges.pipe(map(value => ({ hsva: { v: value } }))),
      this.form.controls.alpha.valueChanges.pipe(map(alpha => ({ hsva: { a: alpha } }))),
      this.form.controls.hex.valueChanges.pipe(map((rgb: RGBA) => ({ red: rgb.r, green: rgb.g, blue: rgb.b }))),
      this.form.controls.red.valueChanges.pipe(map(red => ({ red }))),
      this.form.controls.green.valueChanges.pipe(map(green => ({ green }))),
      this.form.controls.blue.valueChanges.pipe(map(blue => ({ blue }))),
    ).pipe(
      startWith(initialValue),
      scan((acc, value: any) => {
        let hsva: HSVA;
        let rgba: RGBA;
        if (value.hsva) {
          hsva = { ...acc.hsva, ...value.hsva };
          rgba = hsvaToRgba(hsva);
        } else {
          const { red, green, blue, alpha } = { ...acc, ...value } as any;
          rgba = { r: red, g: green, b: blue, a: alpha / 100 };
          hsva = rgbaToHsva(rgba);
        }

        return {
          hsva,
          hue: hsva.h,
          saturation: hsva.s,
          value: hsva.v,
          alpha: hsva.a,
          hex: rgba,
          red: rgba.r,
          green: rgba.g,
          blue: rgba.b,
        };
      }, initialValue),
    )),
    tap((value) => {
      this.form.patchValue(value, { emitEvent: false });
      if (this.onChange && this.form.dirty) {
        if (this.form.get('hex').dirty) {
          this.onTouch();
        }
        const { red, green, blue, alpha } = value as any;
        const [r, g, b, a] = [red, green, blue, alpha / 100];
        this.onChange({ r, g, b, a });
        if (this.form.get('hex').dirty) {
          this.changeOn.next();
          this.form.get('hex').markAsPristine();
        }
      }
    }),
    shareReplay(1),
  );

  hsv$: Observable<{ hue: any; saturation: any; value: any }> = this.valueChanges$.pipe(
    map<any, any>(({ hue, value, red, green, blue }) => {
      const hsva = new HSVA(hue, 100, 100, 100);
      const { r, g, b } = hsvaToRgba(hsva);

      const start = hsvaToRgba(new HSVA(hue, 0, value, 100));
      const end = hsvaToRgba(new HSVA(hue, 100, value, 100));

      const valueRgb = hsvaToRgba(new HSVA(0, 0, value, 100));

      return {
        hue: {
          '--slider-thumb': `rgb(${r},${g},${b})`,
        },
        saturation: {
          '--unfilled':
            `linear-gradient(90deg, rgb(${start.r},${start.g},${start.b}) 0%, rgb(${end.r},${end.g},${end.b}) 100%)`,
          '--slider-thumb': `rgb(${red},${green},${blue})`,
        },
        value: {
          '--unfilled': `linear-gradient(90deg, #000000 0%, #ffffff 100%)`,
          '--slider-thumb': `rgb(${valueRgb.r},${valueRgb.g},${valueRgb.b})`,
        },
      };
    }),
  );

  constructor(
    private elementRef: ElementRef,
    @Optional() @Self() public ngControl: NgControl,
  ) {
    if (this.ngControl !== null) {
      this.ngControl.valueAccessor = this;
    }
  }

  registerOnChange(fn: any): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: any): void {
    this.onTouch = fn;
  }

  onValueChange(): void {
    this.onTouch();
    const { red, green, blue, alpha } = this.form.value as any;
    const [r, g, b, a] = [red, green, blue, alpha / 100];
    this.onChange({ r, g, b, a });
    this.changeOn.next();
  }

  writeValue(value: RGB | RGBA | string): void {
    let rgba: RGBA;
    if (!value || value === 'inherit') {
      rgba = { r: 255, g: 255, b: 255, a: 1 }
    } else if (typeof value === 'string') {
      rgba = stringToRgba(value);
    } else if (isRGBA(value)) {
      rgba = value;
    } else {
      rgba = { ...value, a: 1 };
    }

    this.form.markAsPristine();
    this.rgbaValue$.next(rgba);
  }
}
