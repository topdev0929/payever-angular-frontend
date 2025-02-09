import { Directive } from '@angular/core';

import { PERSON_TYPE } from '../tokens';
import { PersonTypeEnum } from '../types';


@Directive({
  selector: '[peGuarantorTypeDirective]',
  providers: [
    {
      provide: PERSON_TYPE,
      useValue: PersonTypeEnum.Guarantor,
    },
  ],
})
export class GuarantorTypeDirective {
}
