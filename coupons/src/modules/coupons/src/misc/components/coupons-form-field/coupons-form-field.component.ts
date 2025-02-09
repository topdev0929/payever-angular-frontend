import { AfterViewInit, ChangeDetectionStrategy, ChangeDetectorRef, Component, ContentChild } from '@angular/core';

import { PeCouponsFormFieldPrefixDirective } from './coupons-form-field-prefix.directive';
import { PeCouponsFormFieldSubscriptDirective } from './coupons-form-field-subscript.directive';
import { PeCouponsFormFieldSuffixDirective } from './coupons-form-field-suffix.directive';


@Component({
  selector: 'pe-coupons-form-field',
  templateUrl: './coupons-form-field.component.html',
  styleUrls: ['./coupons-form-field.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PeCouponsFormFieldComponent implements AfterViewInit {

  showPrefix: boolean = false;
  showSuffix: boolean = false;
  showSubscript: boolean = false;

  @ContentChild(PeCouponsFormFieldPrefixDirective) prefix: PeCouponsFormFieldPrefixDirective;
  @ContentChild(PeCouponsFormFieldSuffixDirective) suffix: PeCouponsFormFieldSuffixDirective;
  @ContentChild(PeCouponsFormFieldSubscriptDirective) subscript: PeCouponsFormFieldSubscriptDirective;

  constructor(private changeDetectorRef: ChangeDetectorRef) {}

  ngAfterViewInit(): void {
    this.showPrefix = this.prefix != null;
    this.showSuffix = this.suffix != null;
    this.showSubscript = this.subscript != null;
    this.changeDetectorRef.detectChanges();
  }
}