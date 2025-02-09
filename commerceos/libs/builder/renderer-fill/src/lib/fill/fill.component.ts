import { ChangeDetectionStrategy, Component, Input } from '@angular/core';

import { PebFill, PebFillType, PebRenderContainer, PebRenderElementModel } from '@pe/builder/core';

@Component({
  selector: 'peb-fill',
  templateUrl: './fill.component.html',
  styleUrls: ['./fill.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PebFillComponent {
  @Input() element!: PebRenderElementModel;
  @Input() fill!: PebFill;
  @Input() container!: PebRenderContainer;

  fillType = PebFillType;
}
