import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
    selector: 'pe-loading-box',
    templateUrl: './loading-box.component.html',
    styleUrls: ['./loading-box.component.scss']
})
export class LoadingBoxComponent {
  @Input() background: string;
  @Output() onStart: EventEmitter<boolean> = new EventEmitter();

  handleStart(): void {
    this.onStart.emit();
  }
}
