import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

import { EnvService } from '@pe/common';
import { BusinessInterface } from '@pe/common/micro/types/business';

@Injectable()
export class SandboxEnv implements EnvService {
  constructor() {}

  protected shopIdSubject: BehaviorSubject<string> = new BehaviorSubject<string>(
    '',
  );
  protected terminalIdSubject: BehaviorSubject<string> = new BehaviorSubject<string>(
    '',
  );

  set shopId(value: string) {
    this.shopIdSubject.next(value);
  }

  set terminalId(value: string) {
    this.terminalIdSubject.next(value);
  }

  get businessId(): string {
    return '00d6d43b-4f6f-4d37-ae22-cf5158920e90';
  }

  get shopId(): string {
    return 'abb4cf3e-966d-4f46-ac63-cb20c11efcfe';
  }

  get terminalId(): string {
    return this.terminalIdSubject.value;
  }

  get channelId(): string {
    return 'SANDBOX_CHANNEL';
  }

  businessData: BusinessInterface;
}
