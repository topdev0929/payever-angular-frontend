import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'pe-welcome-screen',
  templateUrl: './welcome-screen.component.html'
})
export class WelcomeScreenComponent {
  @Input() background: string;
  @Input() icon: string;
  @Input() title: string;
  @Input() message: string;
  @Input() isLoading: boolean;
  @Output() onStart: EventEmitter<boolean> = new EventEmitter();

  handleStart(): void {
    this.onStart.emit();
  }
}
