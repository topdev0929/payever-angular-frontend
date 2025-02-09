import { ChangeDetectionStrategy, Component, Input } from '@angular/core';

import { PeDestroyService } from '@pe/common';
import { PeGridItem } from '@pe/grid';
import { TranslateService } from '@pe/i18n-core';

import { PaymentLinkStatusType, PaymentLinksInterface } from '../../interfaces';
import { PaymentLinksListService } from '../../services';

@Component({
  selector: 'pe-status-name',
  templateUrl: './status-component.html',
  styleUrls: ['./status-component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [
    PeDestroyService,
  ],
})

export class StatusComponent {
  @Input() item: PeGridItem<PaymentLinksInterface>;
  constructor(
    private paymentLinksListService: PaymentLinksListService,
    private translationService: TranslateService
  ) {
  }

  getLabel(status: PaymentLinkStatusType) {
    return this.translationService.translate(`paymentLinks.${status}`);
  }

  getStatusColor(item: PeGridItem<PaymentLinksInterface>) {
    return this.paymentLinksListService.getStatusColor(item.data.status);
  }
}
