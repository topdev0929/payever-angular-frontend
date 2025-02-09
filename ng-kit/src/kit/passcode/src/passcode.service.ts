import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

@Injectable()
export class PasscodeService {
  passcodeBuzzedEvent: Subject<boolean> = new Subject<boolean>();

  buzz(): void {
    this.passcodeBuzzedEvent.next(true);
  }
}
