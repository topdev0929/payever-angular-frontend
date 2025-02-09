import { Component, ChangeDetectionStrategy, Output, EventEmitter, Input } from '@angular/core';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'payment-error',
  templateUrl: './payment-error.component.html',
  standalone: true,
})
export class PaymentErrorComponent {
  @Input({
    required: true,
  }) errorText: string;

  @Output() tryAgain: EventEmitter<MouseEvent> = new EventEmitter<MouseEvent>();
  doTryAgain(event: MouseEvent): void {
    this.tryAgain.emit(event);
  }
}
