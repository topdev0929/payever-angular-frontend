import { Component, ChangeDetectionStrategy, Output, EventEmitter } from '@angular/core';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'checkout-sdk-form-options-error',
  templateUrl: './form-options-error.component.html',
})
export class FormOptionsErrorComponent {
  @Output() tryAgain: EventEmitter<MouseEvent> = new EventEmitter<MouseEvent>();
  doTryAgain(event: MouseEvent): void {
    this.tryAgain.emit(event);
  }
}
