import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

import { BusinessInterface, PebEnvService } from '@pe/builder-core';

@Injectable()
export class SandboxEnv implements PebEnvService {

  constructor() {}

  protected shopIdSubject: BehaviorSubject<string> = new BehaviorSubject<string>('');
  protected blogIdSubject: BehaviorSubject<string> = new BehaviorSubject<string>('');
  protected terminalIdSubject: BehaviorSubject<string> = new BehaviorSubject<string>('');

  get shopId(): string {
    return this.shopIdSubject.getValue();
  }
  set shopId(value: string) {
    this.shopIdSubject.next(value);
  }

  get blogId(): string {
    return this.blogIdSubject.getValue();
  }
  set blogId(value: string) {
    this.blogIdSubject.next(value);
  }

  get terminalId(): string {
    return this.terminalIdSubject.value;
  }
  set terminalId(value: string) {
    this.terminalIdSubject.next(value);
  }

  get businessId(): string {
    return '2382ffce-5620-4f13-885d-3c069f9dd9b4';
  }

  get channelId(): string {
    return 'SANDBOX_CHANNEL';
  }

  businessData: BusinessInterface;
}
