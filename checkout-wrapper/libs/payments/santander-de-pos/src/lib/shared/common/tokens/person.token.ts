import { InjectionToken } from '@angular/core';

import { PersonTypeEnum } from '../types';

export const PERSON_TYPE = new InjectionToken<PersonTypeEnum>('PERSON_TYPE');
