import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { Select } from '@ngxs/store';
import { Observable } from 'rxjs';
import { map, take, takeUntil, tap } from 'rxjs/operators';

import { PebIntegrationInteractionBase } from '@pe/builder/core';
import { PebElement } from '@pe/builder/render-utils';
import { PebSideBarService } from '@pe/builder/services';
import { PebElementsState } from '@pe/builder/state';
import { PeDestroyService } from '@pe/common';

import { PebIntegrationListComponent } from '../../integrations/integration-list/integration-list.component';
import { IntegrationNodeType } from '../../integrations/models';
import { PebInteractionsFormService } from '../interactions-form.service';

@Component({
  selector: 'peb-interactions-integration-form',
  templateUrl: './interactions-integration-form.component.html',
  styleUrls: [
    '../../../../../styles/src/lib/styles/_sidebars.scss',
    '../interactions-form-edit.component.scss',
    './interactions-integration-form.component.scss',
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [PeDestroyService],
})
export class PebInteractionsIntegrationFormComponent {
  form = this.interactionFormService.editForm;
  @Input() integrationDataType?: IntegrationNodeType;

  @Select(PebElementsState.selected) private readonly selectedElements$!: Observable<PebElement[]>;

  title$ = this.selectedElements$.pipe(
    map(elements => this.getIntegrationTitle(elements)),
    takeUntil(this.destroy$),
  );

  constructor(
    private readonly destroy$: PeDestroyService,
    private readonly sidebarService: PebSideBarService,
    private readonly interactionFormService: PebInteractionsFormService,
  ) {
  }

  openIntegrationList(): void {
    const functionForm = this.sidebarService.openDetail(
      PebIntegrationListComponent,
      { backTitle: 'Back', title: 'Function' },
    );
    functionForm.instance.dataType = this.integrationDataType;
    functionForm.instance.selectedIntegration$.pipe(
      take(1),
      tap((item) => {
        this.form.patchValue({ integrationAction: item });
        this.form.markAsDirty();
        this.form.updateValueAndValidity();
      })
    ).subscribe();
  }

  private getIntegrationTitle(elements: PebElement[]): string {
    if (!elements?.length || elements.length > 1) {
      return '';
    }
    const key: string = this.form.value.key;
    const action = (elements[0].interactions?.[key] as PebIntegrationInteractionBase)?.integrationAction;
    if (!action) {
      return '';
    }

    return action?.title
      ? `Action > ${action.title}`
      : '';
  }
}
