import {
  Type,
 
  Directive,
} from '@angular/core';

import { BaseWidgetCustomElementComponent } from './base-widget-custom-element.component';


@Directive()
export abstract class AbstractBaseWidgetModule {
  abstract resolveComponent(): Type<BaseWidgetCustomElementComponent>;
}
