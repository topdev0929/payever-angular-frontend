import {
  Directive,
  Input,
  TemplateRef,
} from '@angular/core';

import { AbstractFinishComponent } from './abstract-finish-component';

@Directive()
export abstract class AbstractFinishTemplateComponent extends AbstractFinishComponent {
  @Input() template: TemplateRef<any>;
}
