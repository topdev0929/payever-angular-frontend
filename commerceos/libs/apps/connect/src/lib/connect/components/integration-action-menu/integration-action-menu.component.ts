import { Component, EventEmitter, Input, Output } from '@angular/core';
import { Router } from '@angular/router';
import { BehaviorSubject, of } from 'rxjs';
import { catchError, finalize, tap } from "rxjs/operators";

import {
  PaymentsStateService,
  IntegrationsStateService,
  IntegrationCategory,
  IntegrationInfoWithStatusInterface
} from '../../../shared';


@Component({
  selector: 'integration-action-menu',
  templateUrl: './integration-action-menu.component.html',
  styleUrls: ['./integration-action-menu.component.scss'],
})
export class IntegrationActionMenuComponent  {

  @Input() integration: IntegrationInfoWithStatusInterface;
  @Output() saveReturn: EventEmitter<IntegrationCategory> = new EventEmitter();
  isInstallingSubject: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);

  constructor(
    private integrationsStateService: IntegrationsStateService,
    private router: Router,
    private paymentsStateService: PaymentsStateService,
  ) { }

  get name(): string {
    return this.integration?.name;
  }

  uninstallIntegration(): void {
    if (!this.isInstallingSubject.getValue()) {
      this.isInstallingSubject.next(true);
      this.integrationsStateService.installIntegration(this.name, false).pipe(
        tap(() => {
          this.saveReturn.emit(this.integration.category);
          const businessId = this.integrationsStateService.getBusinessId();
          this.router.navigate([
            `business/${businessId}/connect/${this.integration.category}/integrations/${this.integration.name}/done`,
          ]);
        }),
        catchError((error) => {
          this.paymentsStateService.handleError(error, true);

          return of(null);
        }),
        finalize(() => this.isInstallingSubject.next(false),
      )).subscribe();
    }
  }
}
