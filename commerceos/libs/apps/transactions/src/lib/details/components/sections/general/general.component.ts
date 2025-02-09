import { ChangeDetectionStrategy, Component, Injector } from '@angular/core';
import { ViewSelectSnapshot } from '@ngxs-labs/select-snapshot';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import { BaseSectionClass } from '../../../../classes/base-section.class';
import { TransactionsListService } from '../../../../services/list.service';
import { StatusUpdaterService } from '../../../../services/status-updater.service';
import { StatusType } from '../../../../shared/interfaces/status.type';
import { DetailsState } from '../../../store';

@Component({
  selector: 'pe-general-section',
  templateUrl: './general.component.html',
  styleUrls: ['./general.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})

export class GeneralSectionComponent extends BaseSectionClass {
  @ViewSelectSnapshot(DetailsState.quantity) public quantity: number;

  constructor(
    public injector: Injector,
    public listService: TransactionsListService,
    private statusUpdaterService: StatusUpdaterService,
  ) {
    super(injector);
  }

  getStatus$(): Observable<StatusType> {
    return this.statusUpdaterService.getStatus$(this.order.transaction.uuid).pipe(map(s => s || this.order.status.general));
  }
}
