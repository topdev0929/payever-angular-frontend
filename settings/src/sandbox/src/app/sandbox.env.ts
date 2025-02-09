import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import {EnvService} from "@pe/common";
import {BusinessInterface} from "@pe/common/micro/types/business";

@Injectable()
export class SandboxEnv implements EnvService {

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
    return 'e175f408-4e20-4ce0-970e-19fc4428e7a0';
  }

  get channelId(): string {
    return 'SANDBOX_CHANNEL';
  }

  businessData: BusinessInterface;
}
