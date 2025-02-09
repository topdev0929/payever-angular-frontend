import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'ads-root',
  templateUrl: './ads-root.component.html',
  styleUrls: ['./ads-root.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PebAdsComponent {}
