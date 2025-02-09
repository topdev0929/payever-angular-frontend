import { Component } from '@angular/core';
import { SelectSnapshot } from '@ngxs-labs/select-snapshot';

import { BusinessInterface } from '@pe/business';
import { BusinessState } from '@pe/user';

@Component({
  selector: 'widget-skeleton',
  templateUrl: './skeleton.component.html',
  styleUrls: ['./skeleton.component.scss'],
})
export class WidgetSkeletonComponent {
  @SelectSnapshot(BusinessState.businessData) businessData: BusinessInterface;
}
