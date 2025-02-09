import { ChangeDetectionStrategy, Component } from '@angular/core';
import { ViewSelectSnapshot } from '@ngxs-labs/select-snapshot';

import { BaseSectionClass } from '../../../../classes/base-section.class';
import { DetailsState } from '../../../store';

@Component({
  selector: 'pe-details-section',
  templateUrl: './details.component.html',
  styleUrls: ['./details.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})

export class DetailsSectionComponent extends BaseSectionClass {
  @ViewSelectSnapshot(DetailsState.downPayment) public downPayment: number;
}
