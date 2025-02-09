import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'toast-bar-doc',
  templateUrl: 'toast-doc.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ToastDocComponent {
  toastExampleTemplate: string = require('!!raw-loader!./examples/error-toast-example/error-toast-example.component.html');
  toastExampleComponent: string = require('!!raw-loader!./examples/error-toast-example/error-toast-example.component.ts');
}
