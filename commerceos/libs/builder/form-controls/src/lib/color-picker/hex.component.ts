import { ChangeDetectionStrategy, Component, OnInit, Optional, Self } from '@angular/core';
import { ControlValueAccessor, FormControl, NgControl, Validators } from '@angular/forms';
import { BehaviorSubject } from 'rxjs';
import { tap } from 'rxjs/operators';

import { hexToRgba, RGBA, rgbaToHex, stringToRgba } from '@pe/builder/color-utils';
import { PEB_WHITE_RGBA } from '@pe/builder/core';
import { PeDestroyService } from '@pe/common';
import { PeCustomValidators } from '@pe/shared/custom-validators';

@Component({
  selector: 'peb-hex-input',
  template: `<input class="input" [formControl]="control"/>`,
  styleUrls: ['./hex.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [PeDestroyService],
})
export class PebHexComponent implements ControlValueAccessor, OnInit {

  private readonly value$ = new BehaviorSubject<RGBA>(null);
  readonly control = new FormControl('',
    [PeCustomValidators.HexValidator, Validators.required, Validators.minLength(7)]);

  onChange: (value: RGBA) => void;
  onTouch: () => void;

  constructor(
    @Optional() @Self() public ngControl: NgControl,
    readonly destroy$: PeDestroyService,
  ) {
    if (this.ngControl !== null) {
      this.ngControl.valueAccessor = this;
    }
  }

  ngOnInit() {
    this.value$.pipe(
      tap((value) => {
        const rgba = value ?? PEB_WHITE_RGBA;
        this.control.patchValue(rgbaToHex(rgba).toUpperCase(), { emitEvent: false });
      }),
    ).subscribe();

    this.control.valueChanges.pipe(
      tap((value) => {
        if (!this.control.invalid) {
          this.value$.next(hexToRgba(value));
          this.onTouch();
          this.onChange(this.value$.getValue());
        }
      })
    ).subscribe();
  }

  registerOnChange(fn: any): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: any): void {
    this.onTouch = fn;
  }

  writeValue(value: RGBA | string): void {
    let rgba: RGBA;
    if (!value || value === 'inherit') {
      rgba = PEB_WHITE_RGBA;
    } else if (typeof value === 'string') {
      rgba = stringToRgba(value);
    } else {
      rgba = value;
    }

    this.value$.next(rgba);
  }
}
