import { Injectable } from '@angular/core';

import { BusinessInterface } from '@pe/builder-core';
import { EnvService } from '@pe/common';

@Injectable()
export class SandboxEnv {

  constructor() {}

  get businessId(): string {
    return '00d6d43b-4f6f-4d37-ae22-cf5158920e90';
  }


  businessData: BusinessInterface;
}
