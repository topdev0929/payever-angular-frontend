import { ChangeDetectionStrategy, Component } from '@angular/core';

import { AbstractWidgetDirective } from '../../abstract.widget';

@Component({
  selector: 'peb-percentage',
  templateUrl: './percentage.component.html',
  styleUrls: ['./percentage.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PePercentageComponent extends AbstractWidgetDirective {

  /** Gets graph procentage */
  getGraphPercentage() {
    return `${
      this.config?.dataSource[1][0] ? this.config?.dataSource[1][0]?.value?.toString().replace(/\D/g, '') : 0
    }, 100`;
  }
}
