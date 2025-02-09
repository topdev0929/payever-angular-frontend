import { CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop';
import { ChangeDetectionStrategy, Component, ElementRef, EventEmitter, Input, Output, Renderer2, ViewChild } from '@angular/core';
import { MatSlideToggleChange } from '@angular/material/slide-toggle';
import { BehaviorSubject } from 'rxjs';

import { IntegrationCategory } from '@pe/shared/checkout';

import {
  IntegrationInfoInterface,
  CheckoutConnectionInterface,
  IntegrationWithConnectionInterface,
  InstalledConnectionInterface,
  PaymentIntegrationInterface,
} from '../../interfaces';
import { StorageService } from '../../services';

interface IntegrationConnectionsInterface extends CheckoutConnectionInterface {
  installed: boolean;
}

interface TransformIntegrationsInterface {
  integration: IntegrationInfoInterface;
  connections: IntegrationConnectionsInterface[];
}

interface SortOrderInterface {
  connectionId: string;
  sortOrder: number;
}

@Component({
  selector: 'checkout-expansion-conn-menu-list',
  templateUrl: './expansion-conn-menu-list.component.html',
  styleUrls: ['./expansion-conn-menu-list.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ExpansionConnMenuListComponent {
  installedIntegrations: TransformIntegrationsInterface[] = null;
  notInstalledIntegrations: TransformIntegrationsInterface[] = null;
  bodyElement: HTMLElement = document.body;

  private installedConnections: InstalledConnectionInterface[] = null;
  @ViewChild('toggleElement') ref: ElementRef;
  @Input() category: IntegrationCategory;
  @Input() checkoutUuid: string;
  @Input() isShowToggleButton = false;
  @Input() noPaddingLeft = false;
  @Input() sizeMd = false;
  @Input() set paymentIntegrations (data: PaymentIntegrationInterface) {
    if (!data) {
      return;
    }

    this.installedConnections = data.installedConnections;
    this.transformIntegrationsData(data);
  }

  @Output() clickedToggleButton = new EventEmitter<IntegrationWithConnectionInterface>();
  @Output() clickedOpenButton = new EventEmitter<IntegrationInfoInterface>();

  openingIntegration$: BehaviorSubject<IntegrationInfoInterface> = new BehaviorSubject(null);

  constructor(
    private storageService: StorageService,
    private elementRef: ElementRef,
    private renderer: Renderer2
  ) {
  }

  toggleClick(event: MatSlideToggleChange,integration: IntegrationInfoInterface, connection: IntegrationConnectionsInterface) {
    this.clickedToggleButton.emit({ event, integration, connection });
  }

  onOpen(integration: IntegrationInfoInterface) {
    if (!this.openingIntegration$.getValue()) {
      this.openingIntegration$.next(integration);
      this.clickedOpenButton.emit(integration);
    }
  }

  isDisabledDragged(connections: IntegrationConnectionsInterface[]): boolean {
    return !this.someConnectionInstalled(connections);
  }

  drop(event: CdkDragDrop<string[]>) {
    moveItemInArray(this.installedIntegrations, event.previousIndex, event.currentIndex);

    const integrationsSortOrder = this.prepareIntegrationsSortOrder();
    this.storageService.patchInstalledCheckoutConnectionsSortOrder(this.checkoutUuid, integrationsSortOrder).subscribe();
  }

  private isConnectionInstalled(connection: CheckoutConnectionInterface): boolean {
    return this.connectionInstalledIndex(connection) >= 0;
  }



  onDragStart() {
    this.renderer.addClass(this.elementRef.nativeElement.closest('.checkout-app-container'), 'grab-cursor');
  }

  onDragEnd() {
    this.renderer.removeClass(this.elementRef.nativeElement.closest('.checkout-app-container'), 'grab-cursor');
  }

  private someConnectionInstalled(
    connections: IntegrationConnectionsInterface[]
  ): boolean {
    return connections.some(connection => connection.installed);
  }

  private connectionInstalledIndex(connection: CheckoutConnectionInterface): number {
    return this.installedConnections.map(conn => conn._id).indexOf(connection._id);
  }

  private sortedIntegrations(integrations: TransformIntegrationsInterface[]): TransformIntegrationsInterface[] {
    return integrations.sort((a, b) => {
      const aInstalled = this.someConnectionInstalled(a.connections);
      const bInstalled = this.someConnectionInstalled(b.connections);

      if (aInstalled && !bInstalled) {
        return -1;
      }

      if (!aInstalled && bInstalled) {
        return 1;
      }

      if (aInstalled && bInstalled) {
        const aConnectionIdx = this.connectionInstalledIndex(a.connections.find(conn => conn.installed));
        const bConnectionsIdx = this.connectionInstalledIndex(b.connections.find(conn => conn.installed));

        return aConnectionIdx > bConnectionsIdx ? 1 : -1;
      }

      return 0;
    });
  }

  private getIntegrationConnections(
    integration: IntegrationInfoInterface,
    connections: CheckoutConnectionInterface[]
  ): CheckoutConnectionInterface[] {
    const result = (connections || []).filter(conn => conn.integration === integration.integration.name);

    return result;
  }

  private transformIntegrationsData(data: PaymentIntegrationInterface): void {
    const installedIntegrationsData: TransformIntegrationsInterface[] = [];
    const notInstalledIntegrationsData: TransformIntegrationsInterface[] = [];
    data.payments.forEach((integration) => {
      const connections = this.getIntegrationConnections(integration, data.connections).map((conn) => {
        return { ...conn, installed: this.isConnectionInstalled(conn) };
      });

      const result = { integration, connections };

      this.someConnectionInstalled(connections)
        ? installedIntegrationsData.push(result)
        : notInstalledIntegrationsData.push(result);
    });

    this.installedIntegrations = this.sortedIntegrations(installedIntegrationsData);
    this.notInstalledIntegrations = notInstalledIntegrationsData;
  }

  private prepareIntegrationsSortOrder(): SortOrderInterface[] {
    let i = 1;

    return this.installedIntegrations.reduce((acc, item) => {
      const connectionsInstalled = item.connections.filter(conn => conn.installed);

      return acc.concat(connectionsInstalled.map(conn => ({
        connectionId: conn._id,
        sortOrder: i++,
      })));
    }, []);
  }
}
