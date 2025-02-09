import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { EnvService } from '@pe/common';
import { BusinessInterface } from '@pe/common/micro/types/business';

@Injectable()
export class PosEnvService extends EnvService {
  businessId$: Observable<string>;
  businessData$: Observable<string>;
  businessId: string;
  businessData: BusinessInterface;
  posId: string;
  businessName: string;
}
