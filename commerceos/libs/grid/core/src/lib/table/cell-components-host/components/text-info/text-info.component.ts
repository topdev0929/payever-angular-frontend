import { ChangeDetectionStrategy, Component, Input } from '@angular/core';

import { PeGridItem } from '../../../../misc/interfaces';

@Component({
  selector: 'pe-text-info-cell',
  template: `
    <div>
      <span>{{ item[this.key] }}</span>
    </div>
  `,
  styleUrls: ['./text-info.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})

export class PeGridTableTextInfoCellComponent {
  @Input() item: PeGridItem;
  @Input() key: string;
}
