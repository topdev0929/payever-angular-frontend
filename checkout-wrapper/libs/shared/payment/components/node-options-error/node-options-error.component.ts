import { Component, ChangeDetectionStrategy, Output, EventEmitter } from '@angular/core';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'payment-node-options-error',
  templateUrl: './node-options-error.component.html',
})
export class NodeOptionsErrorComponent {
  @Output() tryAgain: EventEmitter<MouseEvent> = new EventEmitter<MouseEvent>();
  doTryAgain(event: MouseEvent): void {
    this.tryAgain.emit(event);
  }
}
