import { ChangeDetectionStrategy, Component } from '@angular/core';
import { Select, Store } from '@ngxs/store';
import { Observable, of } from 'rxjs';
import { switchMap, take, tap } from 'rxjs/operators';

import {
  PebAPIDataSourceSchema,
  PebActionSchema,
  PebElementType,
  PebViewElementEventType,
} from '@pe/builder/core';
import { PebElement } from '@pe/builder/render-utils';
import { PebSideBarService } from '@pe/builder/services';
import { PebElementsState } from '@pe/builder/state';
import { PeDestroyService } from '@pe/common';

import { PebFieldSelectorComponent } from '../field-selector/field-selector.component';
import { PebIntegrationListComponent } from '../integration-list/integration-list.component';
import { IntegrationNodeType, PebIntegrationTreeItem } from '../models';
import { PebFunctionFormService } from '../services/function-form.service';
import { PebSchemaResolverService } from '../services/schema-resolver.service';

@Component({
  selector: 'peb-integration-function',
  templateUrl: './integration-form.component.html',
  styleUrls: [
    '../../../../../styles/src/lib/styles/_sidebars.scss',
    '../../interactions/interactions-form-list.component.scss',
    './integration-form.component.scss',
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [PeDestroyService],
})
export class PebIntegrationFormComponent {

  @Select(PebElementsState.selected) private readonly selectedElements$!: Observable<PebElement[]>;
  element: PebElement;

  functionTitleMap = {
    [IntegrationNodeType.Action]: 'Integration Action',
    [IntegrationNodeType.ContextField]: 'Context Field',
    [IntegrationNodeType.DataSource]: 'Data Source',
  }

  integration$ = this.selectedElements$.pipe(
    switchMap( elem => of({ ...elem?.[0]?.integration || {} }))
  )

  constructor(
    private store: Store,
    private sidebarService: PebSideBarService,
    private functionFormService: PebFunctionFormService,
    private schemaResolverService: PebSchemaResolverService,
  ) {
  }

  openActions() {
    if (!this.canAddIntegration()) {
      return;
    }

    const functionForm = this.sidebarService.openDetail(
      PebIntegrationListComponent,
      {
        backTitle: 'Back',
        title: 'Integration Action',
      },
    );
    functionForm.instance.dataType = IntegrationNodeType.Action;
    functionForm.instance.selectedIntegration$.pipe(
      tap(item => this.selectAction(item)),
      take(1),
    ).subscribe();
  }

  openDataSources() {
    if (!this.canAddIntegration()) {
      return;
    }

    const functionForm = this.sidebarService.openDetail(
      PebIntegrationListComponent,
      {
        backTitle: 'Back',
        title: 'Data Source',
      },
    );
    functionForm.instance.dataType = IntegrationNodeType.DataSource;
    functionForm.instance.selectedIntegration$.pipe(
      tap(item => this.selectDataSource(item)),
      take(1),
    ).subscribe();
  }

  openContextField() {
    if (!this.canAddIntegration()) {
      return;
    }

    const element = this.store.selectSnapshot<PebElement[]>(PebElementsState.selected)[0];
    const contextSelector = this.sidebarService.openDetail(
      PebFieldSelectorComponent,
      { backTitle: 'Back', title: 'Context Field' },
    );

    this.schemaResolverService.getElementContextSchema$(element, '').pipe(
      switchMap((schema) => {
        contextSelector.instance.schema = schema;

        return contextSelector.instance.selected$.pipe(
          tap(item => item.value === 'value'
            ? this.removeContextField()
            : this.functionFormService.setFieldSchema(item)
          ),
          take(1),
        );
      }),
      take(1),
    ).subscribe();
  }

  removeActions() {
    this.functionFormService.removeActions();
  }

  removeDataSource() {
    this.functionFormService.removeDataSource();
  }

  removeContextField() {
    this.functionFormService.removeContextField();
  }

  removeByType(dataType: string): void {
    const dataTypes = [dataType];
    this.functionFormService.removeIntegrationByType(dataTypes);
  }

  selectAction(item: PebIntegrationTreeItem) {
    if (item.type !== IntegrationNodeType.Action) {
      return;
    }
    this.functionFormService.setAction(item.value as PebActionSchema, PebViewElementEventType.Click);
  }

  selectDataSource(item: PebIntegrationTreeItem) {
    if (item.type !== IntegrationNodeType.DataSource) {
      return;
    }
    this.functionFormService.setDataSourceSchema(item.value as PebAPIDataSourceSchema);
  }

  private canAddIntegration(): boolean {
    const element = this.getSelectedElement();

    return element && element.parent?.type !== PebElementType.Grid;
  }

  private getSelectedElement(): PebElement {
    return this.store.selectSnapshot(PebElementsState.selected)[0];
  }
}
