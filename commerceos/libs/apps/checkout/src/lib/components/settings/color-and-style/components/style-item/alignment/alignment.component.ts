import { ChangeDetectionStrategy, Component, Injector } from '@angular/core';

import { TranslateService } from '@pe/i18n-core';

import { ALIGNMENTS } from '../../../constants';
import { BaseStyleItemComponent } from '../base-item.component';

@Component({
  selector: 'pe-style-alignment',
  templateUrl: './alignment.component.html',
  styleUrls: ['./alignment.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class StyleAlignmentComponent extends BaseStyleItemComponent {
  readonly alignmentIcons = ALIGNMENTS;

  constructor(
    protected injector: Injector,
    private translateService: TranslateService,
  ) {
    super(injector);
  }

  get selectedAlignment(): string {
    return this.control.value;
  }

  setSelectedAlignment(alignment: string): void {
    this.control.setValue(alignment);
  }
}
