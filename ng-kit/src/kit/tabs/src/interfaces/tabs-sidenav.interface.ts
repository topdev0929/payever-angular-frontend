import { TemplateRef } from '@angular/core';

export interface TabsSidenavConfigInterface {
  disabled?: boolean;
  icon?: string;
  content: TemplateRef<any>;
  iconSize: number;
}
