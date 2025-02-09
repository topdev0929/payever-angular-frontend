import {
  Component,
  ChangeDetectionStrategy,
  Input,
  Output,
  EventEmitter,
  HostBinding,
  AfterViewInit,
} from '@angular/core';
import { timer } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import { TimestampEvent } from '@pe/checkout/types';
import { PeDestroyService } from '@pe/destroy';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'checkout-sdk-continue-button',
  templateUrl: './continue-button.component.html',
  providers: [PeDestroyService],
})
export class ContinueButtonComponent implements AfterViewInit {

  @Input() darkMode = false;
  @Input() disabled = false;
  @Input() text: string;
  @Input() loading = false;
  @Input() tabIndex: number = null;
  @Input() type: 'button' | 'submit' = 'button';

  @Output() clicked: EventEmitter<TimestampEvent> = new EventEmitter();
  @Output() shown: EventEmitter<TimestampEvent> = new EventEmitter();

  @HostBinding('class.checkout-wrapper-sdk-continue-button') hostClass = true;

  constructor(private destroy$: PeDestroyService) {}

  onClicked(): void {
    if (!this.disabled && !this.loading) {
      this.clicked.emit(new TimestampEvent());
    }
  }

  ngAfterViewInit(): void {
    timer(10).pipe(takeUntil(this.destroy$)).subscribe(() => this.shown.emit(new TimestampEvent()));
  }

}
