import { TemplateRef } from '@angular/core';

import { PeFilterConditions, PeFilterType } from '@pe/grid/shared';

export const PeTwoFieldsConditions = [PeFilterConditions.Between, PeFilterConditions.BetweenDates];

export interface FilterInterface {
  fieldName: string;
  label: string;
  filterConditions: PeFilterConditions[];
  type: PeFilterType;
}

export interface PeFilterKeyInterface { // TODO Take as PeDataGridFilterItems from @pe/common
  fieldName: string;
  filterConditions: PeFilterConditions[];
  label: string;
  type: PeFilterType;
  options?: {
    label: string;
    value: string;
  }[];
  containsTranslations?: boolean;
}

export interface PeCustomMenuItemInterface {
  icon: string;
  label: string;
  onClick: () => void;
}

export interface PeCustomMenuInterface {
  title: string;
  items?: PeCustomMenuItemInterface[];
  icon?: string;
  templateRef?: TemplateRef<any>;
}
