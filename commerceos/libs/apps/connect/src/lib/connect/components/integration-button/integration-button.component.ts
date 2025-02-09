import { Location } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { catchError, finalize } from "rxjs/operators";

import {
  IntegrationCategory,
  IntegrationInfoWithStatusInterface,
  IntegrationsStateService,
  PaymentsStateService,
} from '../../../shared';

@Component({
  selector: 'integration-button',
  templateUrl: './integration-button.component.html',
  styleUrls: ['./integration-button.component.scss'],
})
export class IntegrationButtonComponent {

  @Input() size = 'xs';
  @Input() integration: IntegrationInfoWithStatusInterface;
  @Output() saveReturn: EventEmitter<IntegrationCategory> = new EventEmitter();

  isInstallingSubject: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
  isInstalling$: Observable<boolean> = this.isInstallingSubject.asObservable();

  constructor(
    private _location: Location,
    private integrationsStateService: IntegrationsStateService,
    private paymentsStateService: PaymentsStateService,
  ) {
  }

  get name(): string {
    return this.integration?.name;
  }

  get installed(): boolean {
    return this.integration?._status?.installed;
  }

  installIntegration(event: Event): void {
    event.stopPropagation();

    this.saveReturn.emit(this.integration.category);

    if (this.installed) {
      this.paymentsStateService.openInstalledIntegration(this.integration);
    } else if (!this.isInstallingSubject.getValue()) {
      this.isInstallingSubject.next(true);
      this.paymentsStateService.installIntegrationAndGoToDone(true, this.integration)
        .pipe(
          catchError((error) => {
            this.paymentsStateService.handleError(error, true);

            return of(null);
          }),
          finalize(() => this.isInstallingSubject.next(false))
        )
        .subscribe();
    }
  }
}
