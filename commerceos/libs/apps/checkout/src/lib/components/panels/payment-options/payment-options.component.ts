import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { combineLatest, Observable } from 'rxjs';
import { filter, map, take, takeUntil } from 'rxjs/operators';

import { IntegrationCategory } from '@pe/shared/checkout';

import {
  CheckoutConnectionInterface,
  InstalledConnectionInterface,
  IntegrationInfoInterface,
  IntegrationWithConnectionInterface,
  PaymentIntegrationInterface,
} from '../../../interfaces';
import { AbstractPanelComponent } from '../abstract-panel.component';

@Component({
  selector: 'panel-payment-options',
  templateUrl: './payment-options.component.html',
  styleUrls: ['./payment-options.component.scss', '../page-container.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class PanelPaymentOptionsComponent extends AbstractPanelComponent implements OnInit {

  payments$: Observable<IntegrationInfoInterface[]> = null;
  connections$: Observable<CheckoutConnectionInterface[]> = null;
  installedConnections$: Observable<InstalledConnectionInterface[]> = null;

  paymentIntegrations$: Observable<PaymentIntegrationInterface> = null;

  ngOnInit(): void {
    super.ngOnInit();

    this.payments$ = this.storageService.getCategoryInstalledIntegrationsInfo(IntegrationCategory.Payments, true)
      .pipe(filter(d => !!d));
    this.connections$ = this.storageService.getBusinessConnections(true)
      .pipe(filter(d => !!d));
    this.installedConnections$ = this.storageService.getInstalledCheckoutConnections(this.checkoutUuid, true)
      .pipe(filter(d => !!d));

    this.paymentIntegrations$ = combineLatest([
      this.payments$,
      this.connections$,
      this.installedConnections$,
    ]).pipe(
      map(([payments, connections, installedConnections]) => ({ payments, connections, installedConnections })),
      takeUntil(this.destroy$),
    );
  }

  onToggleIntegrationConnection(data: IntegrationWithConnectionInterface) {
    let isRequestedSucceffully = false;

    this.installedConnections$.pipe(
      takeUntil(this.destroy$),
      filter(d => !!d),
      take(1)
    ).subscribe((installed) => {
      this.storageService.toggleCheckoutConnection(
        this.checkoutUuid,
        data.connection._id,
        installed.map(ins => ins._id).indexOf(data.connection._id) < 0
      ).subscribe(() => {
        this.onUpdateData();
      }, (err) => {
        if (err) {
          this.storageService.showError(err);
        }

        isRequestedSucceffully = false;
        data.event.source.checked = !data.event.source.checked;
      }, () => {
        if (!isRequestedSucceffully) {
          this.connections$ = this.storageService.getBusinessConnections(true).pipe(filter(d => !!d));
        }
      });
    });
  }
}
