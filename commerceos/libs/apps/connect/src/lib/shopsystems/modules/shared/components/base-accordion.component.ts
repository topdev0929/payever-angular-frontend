import { Directive, QueryList } from '@angular/core';
import { MatExpansionPanel } from '@angular/material/expansion';

import { ApiKeysBaseComponent } from '../../../../shared/components';
import { NavigationService } from '../../../../shared/services';

@Directive()
export abstract class ShopsystemsBaseAccordionComponent extends ApiKeysBaseComponent {

  protected navigationService: NavigationService = this.injector.get(NavigationService);

  handleClose(): void {
    this.navigationService.returnBack();
  }

  protected showFirstPanel(panelsList: QueryList<MatExpansionPanel>): void {
    let hasExpanded = false;
    const panels: MatExpansionPanel[] = panelsList['_results'] || [];
    for (const panel of panels) {
      if (panel.expanded && !panel.disabled) {
        hasExpanded = true;
        break;
      }
    }
    if (!hasExpanded) {
      for (let panel of panels) {
        if (!panel.disabled) {
          panel.expanded = true;
          break;
        }
      }
    }
  }
}
