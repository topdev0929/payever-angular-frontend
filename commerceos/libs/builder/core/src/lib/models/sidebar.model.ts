import { ViewRef } from '@angular/core';

import { SelectOption } from './editor.model';

export interface PebSidebarState {
  viewRef: ViewRef;
  header?: PebSidebarHeader;
}

export interface PebSidebarHeader {
  title?: string;
  backTitle?: string;
}

export interface PebSidebarListOptionsConfig {
  active?: any;
  options: SelectOption[] | SelectOption[][];
}
