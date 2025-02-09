import { ChangeDetectionStrategy, Component } from '@angular/core';
import { Select } from '@ngxs/store';
import { Observable } from 'rxjs';
import { map, takeUntil } from 'rxjs/operators';

import { PebElement } from '@pe/builder/render-utils';
import { PebSideBarService } from '@pe/builder/services';
import { PebElementsState } from '@pe/builder/state';
import { PeDestroyService } from '@pe/common';

import { PebIntegrationFormComponent } from './integration-form/integration-form.component';
import { PebFunctionFormService } from './services/function-form.service';

@Component({
  selector: 'peb-function-form',
  templateUrl: './function-form.component.html',
  styleUrls: [
    '../../../../styles/src/lib/styles/_sidebars.scss',
    './function-form.component.scss',
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [PeDestroyService],
})
export class PebFunctionFormComponent {

  @Select(PebElementsState.selected) private readonly selectedElements$!: Observable<PebElement[]>;

  title$ = this.selectedElements$.pipe(
    map(elements => this.functionFormService.getIntegrationTitle(elements)),
    takeUntil(this.destroy$),
  );

  constructor(
    private readonly destroy$: PeDestroyService,
    private readonly sidebarService: PebSideBarService,
    private readonly functionFormService: PebFunctionFormService,
  ) {
  }

  openIntegrationForm(): void {
    this.sidebarService.openDetail(
      PebIntegrationFormComponent,
      { backTitle: 'Back', title: 'Function' },
    );
  }
}
