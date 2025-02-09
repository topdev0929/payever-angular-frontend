import { Component, EventEmitter, Input, Output } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

import { IntegrationCategory, IntegrationInfoInterface } from '../../../interfaces';

@Component({
  selector: 'checkout-expansion-menu-list',
  templateUrl: './expansion-menu-list.component.html',
  styleUrls: ['./expansion-menu-list.component.scss'],
})
export class ExpansionMenuListComponent {

  @Input() category: IntegrationCategory;
  @Input() integrations: IntegrationInfoInterface[] = [];
  @Input() enabledIntegrations: string[] = null;
  @Input() noActionsIntegrations: string[] = null;
  @Input() isShowAddButton = true;
  @Input() isShowToggleButton = false;
  @Input() noPaddingLeft = false;
  @Input() sizeMd = false;

  @Output() clickedToggleButton = new EventEmitter<IntegrationInfoInterface>();
  @Output() clickedIntegrationButton = new EventEmitter<IntegrationInfoInterface>();
  @Output() clickedAddButton = new EventEmitter<IntegrationCategory>();

  openingIntegration$: BehaviorSubject<IntegrationInfoInterface> = new BehaviorSubject(null);

  toggleClick(integration: IntegrationInfoInterface) {
    this.clickedToggleButton.emit(integration);
  }

  onOpen(integration: IntegrationInfoInterface) {
    if (!this.openingIntegration$.getValue()) {
      this.openingIntegration$.next(integration);
      this.clickedIntegrationButton.emit(integration);
    }
  }
}
