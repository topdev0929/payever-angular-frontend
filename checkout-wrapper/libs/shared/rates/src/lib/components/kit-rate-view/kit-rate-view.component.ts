import { ChangeDetectionStrategy, Component, Input } from '@angular/core';

import { RateDetailInterface } from '../../types';

@Component({
  selector: 'pe-rate-view',
  templateUrl: 'kit-rate-view.component.html',
  styleUrls: ['kit-rate-view.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class KitRateViewComponent {

  @Input() rate: RateDetailInterface;
  @Input() notSelected = false;
  @Input() previewMode = false;
  @Input() previewAsSingleLine = false;

}
