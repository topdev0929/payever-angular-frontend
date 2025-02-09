import { Component, Injector, OnInit } from '@angular/core';
import { debounceTime, filter, takeUntil, tap } from 'rxjs/operators';

import { PeOverlayConfig, PeOverlayRef, PeOverlayWidgetService } from '@pe/overlay-widget';
import { IntegrationCategory } from '@pe/shared/checkout';

import { CustomChannelTypeEnum, IntegrationInfoInterface } from '../../../interfaces';
import { QRAppComponent } from '../../channel-settings/qr-app/qr-app.component';
import { AbstractPanelComponent } from '../abstract-panel.component';

@Component({
  selector: 'panel-connect',
  templateUrl: './connect.component.html',
  styleUrls: ['./connect.component.scss'],
})
export class PanelConnectComponent extends AbstractPanelComponent implements OnInit {

  dialogRef: PeOverlayRef;

  connectsReady = false;
  connects$ = this.storageService.getCategoryInstalledIntegrationsInfo(
    [IntegrationCategory.Communications, IntegrationCategory.Accountings]
  ).pipe(
    filter(d => !!d),
    takeUntil(this.destroy$),
    debounceTime(100),
    tap(() => this.connectsReady = true));

  constructor(
    injector: Injector,
    private overlayService: PeOverlayWidgetService,
  ) {
    super(injector);
  }

  ngOnInit(): void {
    super.ngOnInit();
  }

  openApp(integration: IntegrationInfoInterface) {
    if (integration?.integration?.name === CustomChannelTypeEnum.QR ) {
      this.initModal();
    } else {
      this.clickedIntegrationOpenButton(integration);
    }
  }

  private initModal() {
    const config: PeOverlayConfig = {
      data: {
        checkoutUuid: this.checkoutUuid,
      },
      hasBackdrop: true,
      backdropClass: 'channels-modal',
      panelClass: 'connect-qr-modal',
      headerConfig: {
        title: this.translateService.translate('connect.qr.title'),
        backBtnTitle: this.translateService.translate('actions.cancel'),
        backBtnCallback: () => {
          this.overlayService.close();
        },
        doneBtnTitle: this.translateService.translate('create_checkout.done'),
        doneBtnCallback: () => {
          this.overlayService.close();
        },
      },
      component: QRAppComponent,
    };
    this.dialogRef = this.overlayService.open(config);
  }
}
