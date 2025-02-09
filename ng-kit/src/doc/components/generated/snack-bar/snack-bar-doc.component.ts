import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'snack-bar-doc',
  templateUrl: 'snack-bar-doc.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SnackBarDocComponent {
  snackBarDefaultExampleTemplate: string = require('!!raw-loader!./examples/snack-bar-default-example/snack-bar-default-example.component.html');
  snackBarDefaultExampleComponent: string = require('!!raw-loader!./examples/snack-bar-default-example/snack-bar-default-example.component.ts');
}
