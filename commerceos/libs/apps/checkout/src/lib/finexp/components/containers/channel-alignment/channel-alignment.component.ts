import { ChangeDetectionStrategy, Component, ElementRef, forwardRef } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { BehaviorSubject } from 'rxjs';

import { PeDestroyService } from '@pe/common';
import { AlignmentEnum } from '@pe/finexp-app';

import { BaseSelectComponent } from '../../base-select.component';


const ALIGNMENTS = {
  left: '#icon-alignment-left-25',
  center: '#icon-alignment-center-25',
  right: '#icon-alignment-right-25',
};

const DATE_VALUE_ACCESSOR = {
  provide: NG_VALUE_ACCESSOR,
  useExisting: forwardRef(() => ChannelAlignmentComponent),
  multi: true,
};

@Component({
  selector: 'checkout-channel-alignment',
  templateUrl: './channel-alignment.component.html',
  styleUrls: ['../channel-item.base.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [
    PeDestroyService,
    DATE_VALUE_ACCESSOR,
  ],
})
export class ChannelAlignmentComponent extends BaseSelectComponent implements ControlValueAccessor {
  protected destroyed$ = this.injector.get(PeDestroyService);
  protected elementRef = this.injector.get(ElementRef);

  readonly alignmentIcons = ALIGNMENTS;

  selectedAlignment$ = new BehaviorSubject<AlignmentEnum>(AlignmentEnum.Left);

  onChange = (_: any) => {};

  onTouched = () => {};

  setSelectedAlignment(alignment: AlignmentEnum): void {
    this.writeValue(alignment);
    this.onChange(alignment);
    this.closeDropdown();

  }

  writeValue(value: AlignmentEnum): void {
    this.selectedAlignment$.next(value);
    this.cdr.detectChanges();
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  registerOnChange(fn: () => void): void {
    this.onChange = fn;
  }
}
