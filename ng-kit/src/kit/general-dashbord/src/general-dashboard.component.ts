import { Component, Input } from '@angular/core';

import {
  GeneralDashboardItemInterface,
  GeneralDashboardSwitcherInterface,
  GeneralDashboardButtonInterface
} from './general-dashboard.interfaces';

@Component({
  selector: 'pe-general-dashboard',
  templateUrl: 'general-dashboard.component.html',
  styleUrls: ['general-dashboard.component.scss']
})
export class GeneralDashboardComponent {
  readonly countItems: number = 2;
  showItemCount: number = this.countItems;

  @Input() dashboardItems: GeneralDashboardItemInterface[] = [];

  onClick(event: Event, item: GeneralDashboardButtonInterface): void {
    event.preventDefault();
    if (typeof item.btnClickHandler === 'function') {
      item.btnClickHandler();
    }
  }

  onChange(event: Event, item: GeneralDashboardSwitcherInterface): void {
    if (typeof item.switcherChangeHandler === 'function') {
      item.switcherChangeHandler(event);
    }
  }

  onShowAll(index: number): void {
    this.showItemCount = this.showItemCount === this.countItems
          ? this.dashboardItems[index].subItems.length
          : this.countItems;
  }
}
