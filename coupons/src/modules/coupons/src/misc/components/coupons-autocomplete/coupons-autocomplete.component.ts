import { ChangeDetectionStrategy, Component, ElementRef, EventEmitter, Inject, Input, OnInit, Output, ViewChild } from '@angular/core';
import { FormControl } from '@angular/forms';
import { Observable } from 'rxjs';
import { map, startWith } from 'rxjs/operators';
import { NgScrollbar } from 'ngx-scrollbar';

import { AppThemeEnum, EnvService } from '@pe/common';

import { PeCouponOption } from '../../interfaces/coupon-option.interface';


@Component({
  selector: 'pe-coupons-autocomplete',
  templateUrl: './coupons-autocomplete.component.html',
  styleUrls: ['./coupons-autocomplete.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class PeCouponsAutocompleteComponent implements OnInit {

  @Input() items: PeCouponOption[];
  @Input() placeholder?: string = 'Search';

  @Output() onSelected = new EventEmitter<PeCouponOption>();

  @ViewChild('input', { static: true }) elementRef: ElementRef;
  @ViewChild(NgScrollbar, { static: true, read: ElementRef })  scrollbar: NgScrollbar;

  formControl: FormControl = new FormControl('');
  filteredItems: Observable<PeCouponOption[]>;
  theme = this.envService.businessData?.themeSettings?.theme
    ? AppThemeEnum[this.envService.businessData.themeSettings.theme]
    : AppThemeEnum.default;

  constructor(
    private envService: EnvService,
  ) {}

  ngOnInit(): void {
    this.filteredItems = this.formControl.valueChanges.pipe(
      startWith(''),
      map(value => this.filter(value))
    );
  }

  optionSelected(item: PeCouponOption): void {
    this.elementRef.nativeElement.blur();
    this.formControl.patchValue('');

    this.onSelected.emit(item);
  }

  private filter(value: string | any): PeCouponOption[] {
    const filterValue: string = this.normalizeValue(value.title ?? value);
    return this.items.filter(item => this.normalizeValue(item.title).includes(filterValue));
  }

  private normalizeValue(value: string): string {
    return value.toLowerCase().replace(/\s/g, '');
  }

  trackOption(index: number, option: PeCouponOption) {
    return option;
  }
}
