import { ChangeDetectionStrategy, Component } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

import { PeGridItem } from '@pe/grid';

import { PaymentLinksInterface } from '../../interfaces';
import { PaymentLinkDialogService } from '../../services';
import { LinkActionsEnum } from '../dialog/edit-payment-link/edit-payment-link.constant';

@Component({
  selector: 'pe-share-link-cell',
  templateUrl: './share-link-cell.component.html',
  styles: [`
    .pe-copy-link {
      max-width: 100%;
      padding: 0 10px;
    }
    .pe-copy-link__link {
      font-weight: bold;
      display: flex;
      align-items: center;
      gap: 5px;
    }

    .pe-copy-link__icon {
      width: 16px;
      height: 16px;
    }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ShareLinkCellComponent {
  constructor(
    private paymentLinkDialogService: PaymentLinkDialogService,
  ) { }

  item: PeGridItem<PaymentLinksInterface>;
  copied$: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);

  openShareModal(e: MouseEvent) {
    e.stopPropagation();
    this.paymentLinkDialogService.openAction$.next({
      paymentLinkId: this.item.id,
      type: LinkActionsEnum.share,
      link: this.item.data?.redirect_url,
    });
  }
}
