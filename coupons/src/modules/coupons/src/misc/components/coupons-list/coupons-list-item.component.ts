import { ChangeDetectionStrategy, Component, EventEmitter, Output } from '@angular/core';


@Component({
  selector: 'pe-coupons-list-item',
  templateUrl: './coupons-list-item.component.html',
  styleUrls: ['./coupons-list-item.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class PeCouponsListItemComponent {
  @Output() onRemove = new EventEmitter<void>();
}
