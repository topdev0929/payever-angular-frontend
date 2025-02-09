import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'pe-transactions-details-skeleton',
  templateUrl: './skeleton.component.html',
  styleUrls: ['./skeleton.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TransactionsDetailsSkeletonComponent { }
