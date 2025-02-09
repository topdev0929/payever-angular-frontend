import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';

import { PaymentTextModule } from '@pe/checkout/ui/payment-text';

import { PromoStylesComponent } from './styles';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'pe-zinia-bnpl-promo',
  templateUrl: './promo.component.html',
  styleUrls: ['./promo.component.scss'],
  standalone: true,
  imports: [
    PaymentTextModule,
    PromoStylesComponent,
  ],
})
export class PromoComponent implements OnInit {
  public readonly translations = {
    promo: {
      text1: $localize `:@@payment-openbank.promo.text1:`,
      text2: $localize `:@@payment-openbank.promo.text2:`,
      text3: $localize `:@@payment-openbank.promo.text3:`,
    },
  };

  ngOnInit(): void {
    (window as any).PayeverStatic?.SvgIconsLoader?.loadIcons([
      'payment-after-delivery-32',
      'payment-keep-32',
      'payment-pause-32',
    ]);
  }
}
