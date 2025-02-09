import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

import { BusinessInterface, PebEnvService } from '@pe/builder-core';

@Injectable()
export class SandboxEnv implements PebEnvService {

  constructor() {}

  protected shopIdSubject: BehaviorSubject<string> = new BehaviorSubject<string>('');
  protected terminalIdSubject: BehaviorSubject<string> = new BehaviorSubject<string>('');

  set shopId(value: string) {
    this.shopIdSubject.next(value);
  }

  set terminalId(value: string) {
    this.terminalIdSubject.next(value);
  }

  get businessId(): string {
    return 'bc647b61-6039-4f73-a60c-974cc6d70773';
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
