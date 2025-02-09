import { Injectable } from '@angular/core';

import { BusinessInterface } from '@pe/common/micro/types/business';
import { EnvService } from '@pe/common';

@Injectable({ providedIn: 'root' })
export class StudioEnvService extends EnvService {
  businessData: BusinessInterface;
  businessId: string;
  theme = '';
  businessData$;
  businessId$;

  constructor() {
    super();
  }

}
