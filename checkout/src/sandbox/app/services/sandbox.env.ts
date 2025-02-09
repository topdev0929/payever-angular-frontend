import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

import { BusinessInterface, PebEnvService } from '@pe/builder-core';

@Injectable()
export class SandboxEnv implements PebEnvService {

  constructor() {}

  protected shopIdSubject: BehaviorSubject<string> = new BehaviorSubject<string>('');
  protected terminalIdSubject: BehaviorSubject<string> = new BehaviorSubject<string>('');

  get shopId(): string {
    return this.shopIdSubject.getValue();
  }
  set shopId(value: string) {
    this.shopIdSubject.next(value);
  }

  get terminalId(): string {
    return this.terminalIdSubject.value;
  }
  set terminalId(value: string) {
    this.terminalIdSubject.next(value);
  }

  get businessId(): string {
    return 'e17417c2-e09b-41e5-a881-669e9bef49b7';
  }

  get channelId(): string {
    return 'SANDBOX_CHANNEL';
  }

  businessData: BusinessInterface;
}
