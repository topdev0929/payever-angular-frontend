import { Component, ChangeDetectionStrategy, Output, EventEmitter } from '@angular/core';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'payment-variant-error',
  templateUrl: './variant-error.component.html',
})
export class VariantErrorComponent {
  @Output() tryAgain: EventEmitter<MouseEvent> = new EventEmitter<MouseEvent>();
  doTryAgain(event: MouseEvent): void {
    this.tryAgain.emit(event);
  }
}
