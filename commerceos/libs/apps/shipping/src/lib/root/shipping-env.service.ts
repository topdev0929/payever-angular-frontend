import { Injectable } from '@angular/core';
import { SelectSnapshot } from '@ngxs-labs/select-snapshot';
import { Observable } from 'rxjs';

import { EnvService } from '@pe/common';
import { BusinessState } from '@pe/user';


@Injectable({ providedIn: 'root' })
export class ShippingEnvService extends EnvService {
  @SelectSnapshot(BusinessState.businessData) business;

  businessId$: Observable<string>;
  businessData$: Observable<any>;


  get businessId() {
    return this.business._id;
  };

  get businessData() {
    return {
      themeSettings: {
        _id: this.business.themeSettings._id,
        theme: this.business.themeSettings.theme,
      },
    };
  }
}
