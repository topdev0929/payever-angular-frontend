import { AfterViewInit, ChangeDetectionStrategy, ChangeDetectorRef, Component, ContentChild } from '@angular/core';
import { PeCouponsSubscriptDirective } from './coupons-subscript.directive';


@Component({
  selector: 'pe-coupons-form-group',
  templateUrl: './coupons-form-group.component.html',
  styleUrls: ['./coupons-form-group.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class PeCouponsFormGroupComponent implements AfterViewInit {
  showSubscript: boolean = false;

  @ContentChild(PeCouponsSubscriptDirective) subscript: PeCouponsSubscriptDirective;

  constructor(private changeDetectorRef: ChangeDetectorRef) {}

  ngAfterViewInit(): void {
    this.showSubscript = this.subscript != null;
    this.changeDetectorRef.detectChanges();
  }
}
