import { Component, HostBinding, Input } from '@angular/core';

@Component({
  selector: 'pe-toast',
  templateUrl: './toast.component.html',
  styleUrls: ['./toast.component.scss']
})
export class ToastComponent {
  @Input() type: 'error' | 'warning' | 'success';
  @Input() @HostBinding('class.rounded-borders') roundedBorders = true;
  @HostBinding('class.error') get isError(): boolean {
    return this.type === 'error';
  }
}
