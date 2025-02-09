import { ChangeDetectionStrategy, Component, Input } from '@angular/core';

import { PeStatisticsItem, PeStatisticsSingleSelectedAction } from '../../interfaces/statistics.interface';

/**
 * @deprecated
 */
@Component({
  selector: 'peb-add-widget',
  templateUrl: './add-widget.component.html',
  styleUrls: ['./add-widget.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AddWidgetComponent {

  @Input() item: PeStatisticsItem;
  @Input() actions: PeStatisticsSingleSelectedAction[];

  isLoading = false;

  onAction(event: MouseEvent, action: PeStatisticsSingleSelectedAction) {
    event.stopPropagation();
    event.preventDefault();

    action.callback();
  }
}
