import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { EnvService } from '@pe/common';
import { BusinessInterface } from '@pe/common/micro/types/business';

@Injectable()
export class SiteEnvService extends EnvService {
    businessId: string;
    businessData: BusinessInterface;
    siteId: string;
    businessName: string;
    businessId$: Observable<string>;
    businessData$: Observable<BusinessInterface>
}
