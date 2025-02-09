import { ChangeDetectionStrategy, Component, forwardRef } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { BehaviorSubject } from 'rxjs';

import { PeDestroyService } from '@pe/common';
import { ThemeEnum } from '@pe/finexp-app';

import { BaseSelectComponent } from '../../base-select.component';

const DATE_VALUE_ACCESSOR = {
  provide: NG_VALUE_ACCESSOR,
  useExisting: forwardRef(() => ChannelThemeComponent),
  multi: true,
};
@Component({
  selector: 'checkout-channel-theme',
  templateUrl: './channel-theme.component.html',
  styleUrls: ['../channel-item.base.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [
    PeDestroyService,
    DATE_VALUE_ACCESSOR,
  ],
})
export class ChannelThemeComponent extends BaseSelectComponent implements ControlValueAccessor {
  protected destroyed$ = this.injector.get(PeDestroyService);

  themes = Object.values(ThemeEnum);

  selectedTheme$ = new BehaviorSubject<ThemeEnum>(ThemeEnum.Light);

  onChange = (_: any) => {};

  onTouched = () => {};

  setSelectedTheme(theme: ThemeEnum): void {
    this.writeValue(theme);
    this.onChange(theme);
    this.closeDropdown();
  }

  writeValue(value: ThemeEnum): void {
    this.selectedTheme$.next(value);
    this.cdr.detectChanges();
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  registerOnChange(fn: () => void): void {
    this.onChange = fn;
  }
}
