import { TemplateRef } from '@angular/core';

export interface ExampleSettingsInterface {
  title: string;
  tsExample: string;
  htmlExample?: string;
  cssExample?: string;
  content?: TemplateRef<any>;
}
