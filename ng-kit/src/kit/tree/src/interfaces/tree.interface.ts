import { TemplateRef } from '@angular/core';

export interface TreeInterface {
  label?: string;
  level: number;
  children?: TreeInterface[];
  addonPrepend?: TemplateRef<any>;
  content?: TemplateRef<any>;
  hideScheme?: boolean;
}
