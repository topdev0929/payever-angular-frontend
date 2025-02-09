import { Directive } from '@angular/core';

import { PERSON_TYPE } from '../tokens';
import { PersonTypeEnum } from '../types';


@Directive({
  selector: '[peCustomerTypeDirective]',
  providers: [
    {
      provide: PERSON_TYPE,
      useValue: PersonTypeEnum.Customer,
    },
  ],
})
export class CustomerTypeDirective {
}
