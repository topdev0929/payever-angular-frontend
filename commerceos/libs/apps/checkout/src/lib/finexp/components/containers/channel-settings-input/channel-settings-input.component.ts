import { ChangeDetectorRef, Component, EventEmitter, Input, OnInit, Output, ViewChild } from '@angular/core';
import { FormControl } from '@angular/forms';
import { MatTooltip } from '@angular/material/tooltip';
import { isNumber } from 'lodash-es';
import { takeUntil } from 'rxjs/operators';

import { TranslateService } from '@pe/i18n';

import { AbstractComponent } from '../../abstract.component';

@Component({
  selector: 'checkout-channel-input',
  templateUrl: './channel-settings-input.component.html',
  styleUrls: ['./channel-settings-input.component.scss'],
})
export class ChannelSettingsInputComponent extends AbstractComponent implements OnInit {

  @Input() controlName: string;
  @Input() placeholder: string;
  @Input() formControlRef: FormControl;
  @Input() afterPointCount: number = null;
  @Output() inputFocus: EventEmitter<boolean> = new EventEmitter<boolean>();
  @ViewChild('tooltip', { static: true }) tooltip: MatTooltip;

  isFocused: boolean;
  error = '';
  showError = false;

  constructor(
    private cdr: ChangeDetectorRef,
    private translateService: TranslateService
  ) {
    super();
  }

  ngOnInit(): void {
    this.formControlRef.parent.valueChanges.pipe(takeUntil(this.destroyed$)).subscribe(() => {
      const value = this.formControlRef.value;
      const part = value?.toString().replace(',', '.').split('.')[1] || '';
      if (part.length > this.afterPointCount && isNumber(this.afterPointCount)) {
        let newValue = value * Math.pow(10, this.afterPointCount);
        newValue = Math.floor(newValue);
        newValue = newValue / Math.pow(10, this.afterPointCount);
        this.formControlRef.setValue(newValue);
      } else if (this.formControlRef.invalid) {
        const keys: string[] = Object.keys(this.formControlRef.errors);
        let key: string;
        if (keys.length) {
          key = keys[0];
        }

        switch (key) {
          case 'max':
            this.error = this.translateService.translate(
              'finexp.channels.errors.inputMaxLength',
              { value: this.formControlRef.errors[key].max }
              );
            break;
          case 'min':
            this.error = this.translateService.translate(
              'finexp.channels.errors.inputMinLength',
              { value: this.formControlRef.errors[key].min }
              );
            break;
          default:
            this.error = this.translateService.translate('finexp.channels.errors.inputWrongValue');
            break;
        }

        setTimeout(() => {
          if (this.isFocused) {
            this.tooltip.hide(); // need to hide, cos modal could be resized and old tooltip could be on wrong position
            this.tooltip.show();
          }
          this.showError = true;
        }, 0);
      } else {
        this.tooltip.hide();
        this.showError = false;
        this.cdr.detectChanges();
      }
    });
    // To round numbers on init:
    this.formControlRef.updateValueAndValidity({ onlySelf: false, emitEvent: true });
  }

  /**
   * User cannot scroll settings panel by finger when input is focused
   */
  onFocus(): void {
    this.isFocused = true;
    this.inputFocus.emit(true);
  }

  onFocusOut(): void {
    this.isFocused = false;
    this.inputFocus.emit(false);
  }
}
