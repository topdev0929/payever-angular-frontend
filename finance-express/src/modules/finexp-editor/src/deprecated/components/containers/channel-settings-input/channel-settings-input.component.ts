import { Component, EventEmitter, Input, Output, ViewChild } from '@angular/core';
import { FormControl } from '@angular/forms';
import { MatTooltip } from '@angular/material/tooltip';
import { takeUntil } from 'rxjs/operators';

import { TranslateService } from '@pe/i18n';

import { AbstractComponent } from '../../abstract.component';

@Component({
  selector: 'checkout-channel-input',
  templateUrl: './channel-settings-input.component.html',
  styleUrls: ['./channel-settings-input.component.scss']
})
export class ChannelSettingsInputComponent extends AbstractComponent {

  @Input() controlName: string;
  @Input() formControlRef: FormControl;
  @Output() inputFocus: EventEmitter<boolean> = new EventEmitter<boolean>();
  @ViewChild('tooltip', { static: true }) tooltip: MatTooltip;

  error: string = '';
  showError: boolean = false;

  constructor(private translateService: TranslateService) {
    super();
  }

  ngOnInit(): void {
    this.formControlRef.valueChanges.pipe(takeUntil(this.destroyed$)).subscribe((data) => {
      if (this.formControlRef.invalid) {
        const keys: string[] = Object.keys(this.formControlRef.errors);
        let key: string;
        if (keys.length) {
          key = keys[0];
        }

        switch (key) {
          case 'max':
            this.error = this.translateService.translate(
              'channels.errors.input-max-length',
              { value: this.formControlRef.errors[key].max }
              );
            break;
          case 'min':
            this.error = this.translateService.translate(
              'channels.errors.input-min-length',
              { value: this.formControlRef.errors[key].min }
              );
            break;
          default:
            this.error = this.translateService.translate('channels.errors.input-wrong-value');
            break;
        }

        setTimeout(() => {
          this.tooltip.hide(); // need to hide, cos modal could be resized and old tooltip could be on wrong position
          this.tooltip.show();
          this.showError = true;
        }, 0);
      } else {
        this.tooltip.hide();
        this.showError = false;
      }
    });
  }

  /**
   * User cannot scroll settings panel by finger when input is focused
   */
  onFocus(): void {
    this.inputFocus.emit(true);
  }

  onFocusOut(): void {
    this.inputFocus.emit(false);
  }
}
