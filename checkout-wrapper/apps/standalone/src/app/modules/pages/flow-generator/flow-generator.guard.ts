import { Inject, Injectable } from '@angular/core';


import { EnvironmentConfigInterface, PE_ENV } from '@pe/common';

@Injectable()
export class FlowGeneratorGuard {

  constructor(
    @Inject(PE_ENV) private env: EnvironmentConfigInterface,
  ) {}

  canActivate(): boolean {
    return ['test', 'stage'].includes(this.env.config.env);
  }
}
