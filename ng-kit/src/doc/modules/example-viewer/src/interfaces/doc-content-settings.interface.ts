import { TemplateRef } from '@angular/core';

import { ExampleSettingsInterface } from './example-settings.interface';

export interface DocContentSettingsInterface {
  title: string;
  import?: string;
  overview?: TemplateRef<any>;
  sourcePath?: string;
  noDefaultExample?: boolean;
  examples?: ExampleSettingsInterface[];
}
