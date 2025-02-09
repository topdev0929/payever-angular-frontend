import { ChangeDetectionStrategy, Component } from '@angular/core';

import { AbstractWidgetDirective } from '../../abstract.widget';

@Component({
  selector: 'peb-simple-numbers',
  templateUrl: './simple-numbers.component.html',
  styleUrls: ['./simple-numbers.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SimpleNumbersComponent extends AbstractWidgetDirective {
}
