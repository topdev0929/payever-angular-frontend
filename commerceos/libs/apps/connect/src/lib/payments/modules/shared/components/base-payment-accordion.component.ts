import { QueryList } from '@angular/core';
import { MatExpansionPanel } from '@angular/material/expansion';

import { PanelEnum, NavigationService } from '../../../../shared';

import { BasePaymentComponent } from './base-payment.component';

export interface ExpandedTypeIndexInterface {
  type: PanelEnum;
  index: number;
}

export abstract class BasePaymentAccordionComponent extends BasePaymentComponent {

  protected navigationService: NavigationService = this.injector.get(NavigationService);

  handleClose(): void {
    this.navigationService.returnBack();
  }

  protected getExpandedPanelTypeIndex(panelsList: QueryList<MatExpansionPanel>): ExpandedTypeIndexInterface {
    let result: ExpandedTypeIndexInterface = null;
    const panels: MatExpansionPanel[] = panelsList['_results'] || [];
    const indexes: any = {};
    for (const panelItem of panels) {
      let panel: PanelEnum = null;
      try {
        panel = panelItem['_body'].nativeElement.parentElement.attributes['panel'].value;
      } catch (e) {}
      indexes[panel] = indexes[panel] === undefined ? 0 : indexes[panel] + 1;

      if (panelItem.expanded && !panelItem.disabled) {
        result = { type: panel, index: indexes[panel] };
        break;
      }
    }

    return result;
  }

  protected expandPanelByTypeIndex(panelsList: QueryList<MatExpansionPanel>, typeIndex: ExpandedTypeIndexInterface): void {
    const panels: MatExpansionPanel[] = panelsList['_results'] || [];
    for (let panel of panels) {
      panel.expanded = false;
    }
    const indexes: any = {};
    for (let panel of panels) {
      if (!panel.disabled) {
        try {
          if (panel['_body'].nativeElement.parentElement.attributes['panel'].value === typeIndex.type) {
            indexes[typeIndex.type] = indexes[typeIndex.type] === undefined ? 0 : indexes[typeIndex.type] + 1;
            if (indexes[typeIndex.type] === typeIndex.index) {
              panel.expanded = true;
              break;
            }
          }
        } catch (e) {}
      }
    }
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
        panel.expanded = false;
      }
      let index = -1;
      for (let i = 0; i < panels.length; i++) {
        const attrFilled: string = panels[i]['_viewContainerRef'].element.nativeElement.getAttribute('filled');
        if (!panels[i].disabled && attrFilled !== 'true') {
          index = i;
          break;
        }
      }
      if (index < 0) {
        for (let i = 0; i < panels.length; i++) {
          if (!panels[i].disabled) {
            index = i;
            break;
          }
        }
      }
      if (index >= 0) {
        panels[index].expanded = true;
      }
    }
  }

  protected showPanelByStepName(panelsList: QueryList<MatExpansionPanel>, panel: PanelEnum): void {
    const panels: MatExpansionPanel[] = panelsList['_results'] || [];

    for (let panelItem of panels) {
      const attr: PanelEnum = panelItem['_viewContainerRef'].element.nativeElement.getAttribute('panel');
      if (!panelItem.disabled && attr && attr === panel) {
        for (let enabledPanel of panels) {
          enabledPanel.expanded = false;
        }
        panelItem.expanded = true;
        break;
      }
    }
  }

  protected showNextPanelAfterOpened(panelsList: QueryList<MatExpansionPanel>): void {
    let expandedIndex = -1;
    const panels: MatExpansionPanel[] = panelsList['_results'] || [];
    for (let i = 0; i < panels.length; i++) {
      if (panels[i].expanded && !panels[i].disabled) {
        expandedIndex = i;
        break;
      }
    }
    if (expandedIndex >= 0) {
      let newExpandedIndex = -1;
      for (let i = expandedIndex + 1; i < panels.length; i++) {
        const attrFilled: string = panels[i]['_viewContainerRef'].element.nativeElement.getAttribute('filled');
        if (!panels[i].disabled && attrFilled !== 'true') {
          newExpandedIndex = i;
          break;
        }
      }
      if (newExpandedIndex < 0) {
        for (let i = expandedIndex + 1; i < panels.length; i++) {
          if (!panels[i].disabled) {
            newExpandedIndex = i;
            break;
          }
        }
      }
      if (newExpandedIndex >= 0) {
        panels[expandedIndex].expanded = false;
        panels[newExpandedIndex].expanded = true;
      }
    } else {
      this.showFirstPanel(panelsList);
    }
  }
}
