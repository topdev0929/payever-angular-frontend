import { ChangeDetectionStrategy, Component } from '@angular/core';

import { AbstractWidgetDirective } from '../../abstract.widget';

@Component({
  selector: 'peb-two-columns',
  templateUrl: './two-columns.component.html',
  styleUrls: ['./two-columns.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TwoColumnsComponent extends AbstractWidgetDirective {
}
