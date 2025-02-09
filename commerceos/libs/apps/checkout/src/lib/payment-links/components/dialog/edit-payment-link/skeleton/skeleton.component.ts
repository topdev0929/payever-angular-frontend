import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'pe-edit-payment-link-skeleton',
  templateUrl: './skeleton.component.html',
  styleUrls: ['./skeleton.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PeEditPaymentLinkSkeletonComponent { }
