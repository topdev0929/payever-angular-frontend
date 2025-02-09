import { Component, Input } from '@angular/core';

@Component({
  selector: 'pe-error',
  styleUrls: ['error.component.scss'],
  templateUrl: 'error.component.html'
})

export class ErrorComponent {
  @Input() title: string = '';
  @Input() description: string = '';
  @Input() code: string = '';
}
