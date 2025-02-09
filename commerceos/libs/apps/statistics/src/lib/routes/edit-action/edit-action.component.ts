import { ChangeDetectionStrategy, Component, Input } from '@angular/core';

import { isSelectableItem } from '@pe/common';

import { PeStatisticsItem, PeStatisticsSingleSelectedAction } from '../../interfaces/statistics.interface';

/**
 * @deprecated
 */
@Component({
  selector: 'peb-edit-action',
  templateUrl: './edit-action.component.html',
  styleUrls: ['./edit-action.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class EditActionComponent {

  @Input() item: PeStatisticsItem;
  @Input() actions: PeStatisticsSingleSelectedAction[];

  onAction(event: MouseEvent, action: PeStatisticsSingleSelectedAction) {
    event.stopPropagation();
    event.preventDefault();
    if (action.callback) {
      isSelectableItem(this.item) ? action.callback(this.item.id) : action.callback();
    }

    action.callback();
  }

}
