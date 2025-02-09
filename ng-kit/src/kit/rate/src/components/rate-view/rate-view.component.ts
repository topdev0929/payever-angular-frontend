import { ChangeDetectionStrategy, Component, Input } from '@angular/core';

import { RateDetailInterface } from '../../rate.interface';

@Component({
  selector: 'pe-rate-view',
  templateUrl: 'rate-view.component.html',
  styleUrls: ['rate-view.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class RateViewComponent {

  @Input() rate: RateDetailInterface;
  @Input() notSelected: boolean = false;
  @Input() previewMode: boolean = false;
  @Input() previewAsSingleLine: boolean = false;

}
