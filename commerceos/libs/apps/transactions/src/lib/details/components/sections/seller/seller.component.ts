import { ChangeDetectionStrategy, Component } from '@angular/core';


import { BaseSectionClass } from '../../../../classes/base-section.class';

@Component({
  selector: 'pe-seller-section',
  templateUrl: './seller.component.html',
  styleUrls: ['./seller.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})

export class SellerSectionComponent extends BaseSectionClass {

  get sellerName(): string {
    return this.order.seller?.name;
  }

  get sellerEmail(): string {
    return this.order.seller?.email;
  }
}
