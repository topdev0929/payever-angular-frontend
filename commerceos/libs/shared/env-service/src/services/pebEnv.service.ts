import { Injectable } from '@angular/core';
import { SelectSnapshot } from '@ngxs-labs/select-snapshot';

// eslint-disable-next-line @nrwl/nx/enforce-module-boundaries
import { BusinessInterface } from '@pe/business';
import { EnvService } from '@pe/common';
// eslint-disable-next-line @nrwl/nx/enforce-module-boundaries
import { BusinessState } from '@pe/user';

@Injectable({
  providedIn: 'platform',
})
export class PebEnvironmentService extends EnvService {
  @SelectSnapshot(BusinessState.businessData) business: BusinessInterface;

  businessData$;
  businessId$;
  get businessId(): string {
    return this.business._id;
  }

  get businessData() {
    const businessData = this.business;

    return businessData as any;
  }

}
