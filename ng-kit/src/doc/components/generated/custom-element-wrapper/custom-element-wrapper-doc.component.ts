import { Component } from '@angular/core';
import { Subject } from 'rxjs';

import { TimestampEvent } from '../../../../kit/custom-element-wrapper';

// Example of custom emitter that gives ability to pass additional data on Submit
class TimestampEventEx extends TimestampEvent {
  constructor(public payload: string) {
    super();
  }
}

@Component({
  selector: 'custom-element-wrapper-doc',
  templateUrl: 'custom-element-wrapper-doc.component.html',
})
export class CustomElementWrapperDocComponent {

  submit$: Subject<TimestampEvent> = new Subject();
  pay$: Subject<TimestampEventEx> = new Subject();

  valueBoolean: boolean = false;
  valueNumber: number = 12;
  valueString: string = 'de';
  valueObject: { a: string, b: { c: string } } = { a: 'X', b: {c: 'Y' } };

  savedValue: string = '';
  isReady: boolean = false;

  onSubmit(): void {
    // Submit example
    this.submit$.next(new TimestampEvent());
  }

  onPay(): void {
    // Submit example with additional data passed
    this.pay$.next(new TimestampEventEx('PAYLOAD_DATA'));
  }

  onSaved(event: CustomEvent): void {
    this.savedValue = event.detail;
  }

  onReady(event: CustomEvent): void {
    this.isReady = !!event.detail;
  }
}
