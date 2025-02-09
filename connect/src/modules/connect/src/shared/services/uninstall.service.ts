import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { take, tap } from 'rxjs/operators';

import { PeOverlayWidgetService } from '@pe/overlay-widget';

import { DataGridService } from './data-grid.service';
import { IntegrationsStateService } from './integrations-state.service';
import { PaymentsStateService } from './payments-state.service';


@Injectable()
export class UninstallService {

  constructor(
    private dataGridService: DataGridService,
    private integrationsStateService: IntegrationsStateService,
    private paymentsStateService: PaymentsStateService,
    private peOverlayWidgetService: PeOverlayWidgetService,
    private router: Router,
  ) {}

  uninstall(integration): void {
    this.peOverlayWidgetService.close();
    this.paymentsStateService.installIntegrationAndGoToDone(false, integration).pipe(
      take(1),
      tap(data => {
        const url = [`business/${this.integrationsStateService.getBusinessId()}/connect/${integration.category}/integrations/${integration.name}/done`];

        this.router.navigate(url).then(() => {
          const gridItems = this.dataGridService.gridItems$.value;
          const item = gridItems?.find(i => i.id === integration._id);

          if (item) {
            item._cardItem._status.installed = data.installed;
          }

          this.dataGridService.chooseFiltersEmit.emit();
        });
      })
    ).subscribe();
  }

}
