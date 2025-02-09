import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { range } from 'lodash-es';

/**
 * @deprecated Should be removed after migration to pe-choose-rate
 */
@Component({
  selector: 'pe-rate-loading',
  templateUrl: 'rate-loading.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class RateLoadingComponent {
  @Input() linesCount: number = 2;

  range(): number[] {
    return range(this.linesCount);
  }
}
