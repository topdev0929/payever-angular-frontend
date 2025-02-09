import { Type } from '@angular/core';

import { LayoutType } from '../enums';

export interface LayoutModule<T = any> {
  resolveComponent(): Type<T>;
}

export type LayoutComponent = {
  import: () => Promise<Type<LayoutModule>>;
  init?: (...args: any) => Promise<() => void>;
}

export interface LayoutConfig {
  header: LayoutComponent;
  main: LayoutComponent;
}

export type LayoutSelectorConfig = {
  [key in LayoutType]?: LayoutConfig;
}
