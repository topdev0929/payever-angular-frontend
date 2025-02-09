import { Component, Injector, OnDestroy, ViewEncapsulation } from '@angular/core';
import { Location } from '@angular/common';
import { Observable } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import { PeSimpleStepperService } from '@pe/stepper';
import { AppSetUpService, AppSetUpStatusEnum } from '@pe/common';
import { PeOverlayConfig, PeOverlayRef, PeOverlayWidgetService } from '@pe/overlay-widget';

import { CheckoutModule } from '../../../checkout.module';
import { EnvService, RootCheckoutWrapperService } from '../../../services';
import { AbstractPanelComponent } from '../abstract-panel.component';
import { CheckoutChannelSetInterface, CheckoutPanelModalType } from '../../../interfaces';
import { CheckoutClipboardCopyComponent } from '../../checkout-clipboard-copy/checkout-clipboard-copy.component';
import { QRIntegrationComponent } from '../../qr-integration/qr-integration.component';

@Component({
  // tslint:disable-next-line component-selector
  selector: 'panel-checkout',
  templateUrl: './checkout.component.html',
  styleUrls: ['./checkout.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class PanelCheckoutComponent extends AbstractPanelComponent implements OnDestroy {

  theme: string = 'dark';
  link: string;
  dialogRef: PeOverlayRef;
  openedModalType: CheckoutPanelModalType;

  wrapperService: RootCheckoutWrapperService = this.injector.get(RootCheckoutWrapperService);
  isShowCheckout$: Observable<boolean> = this.wrapperService.checkoutVisible$;

  private appSetUpService: AppSetUpService = this.injector.get(AppSetUpService);
  private peStepperService: PeSimpleStepperService = this.injector.get(PeSimpleStepperService);

  constructor(
    injector: Injector,
    private location: Location,
    private envService: EnvService,
    private overlayService: PeOverlayWidgetService,
  ) {
    super(injector);
  }

  ngOnInit(): void {
    super.ngOnInit();
    this.peStepperService.hide();

    this.wrapperService.setParams(this.wrapperService.defaultParams);
    this.wrapperService.cancelEmitted$.pipe(takeUntil(this.destroyed$)).subscribe(() => {
      this.wrapperService.showCheckout(false);
    });
    this.wrapperService.showCheckout(true);

    try {
      this.appSetUpService.setStatus(this.storageService.businessUuid, 'checkout', AppSetUpStatusEnum.Completed).subscribe();
    } catch (e) {
    }

    if (this.activatedRoute?.snapshot?.data.modal && this.activatedRoute?.snapshot?.queryParams.link) {
      this.link = this.activatedRoute?.snapshot?.queryParams.link;
      this.openedModalType = this.activatedRoute.snapshot.data.modal;
      this.initModal();
    }

    this.storageService.getBusiness()
      .pipe(takeUntil(this.destroyed$))
      .subscribe(business => {
        this.theme = business?.themeSettings?.theme && business?.themeSettings?.theme !== 'default' ? business.themeSettings.theme : 'dark';
      });
  }

  ngOnDestroy(): void {
    super.ngOnDestroy();
    this.wrapperService.showCheckout(false);
    this.wrapperService.reCreateFlow(); // Just resetting inputted data
    this.peStepperService.hide();
  }

  onOpenDirectLink(): void {
    this.storageService.getChannelSetsForCheckoutByTypeOnce(this.checkoutUuid, 'link')
      .subscribe((channelSetIds: CheckoutChannelSetInterface[]) => {
        if (channelSetIds && channelSetIds.length > 0) {
          window.open(this.storageService.makeCreateCheckoutLink(this.checkoutUuid, channelSetIds[0].id), '_blank');
        } else {
          console.error('Channel set id not found');
        }
      });

  }

  copyLink() {
    this.link = this.wrapperService.getCopyLink();
    this.openedModalType = CheckoutPanelModalType.ClipboardCopy;
    this.initModal();
  }

  copyLinkWithPrefilled() {
    this.wrapperService.preparePrefilled(link => {
      this.link = link;
      this.openedModalType = CheckoutPanelModalType.ClipboardCopy;
      this.initModal();
    });
  }

  getQr() {
    this.wrapperService.preparePrefilled(link => {
      this.link = link;
      this.openedModalType = CheckoutPanelModalType.QR;
      this.initModal();
    });
  }

  initModal() {
    const config: PeOverlayConfig = {
      data: {
        link: this.link,
        checkoutUuid: this.checkoutUuid,
        businessId: this.envService.businessId,
      },
      hasBackdrop: true,
      backdropClass: 'checkout-panel-modal',
      headerConfig: {
        title: '',
        backBtnTitle: this.translateService.translate('actions.cancel'),
        backBtnCallback: () => {
          this.overlayService.close();
        },
        doneBtnTitle: this.translateService.translate('create_checkout.done'),
        doneBtnCallback: () => {
          this.overlayService.close();
        },
        theme: this.theme,
      },
      component: null,
      lazyLoadedModule: CheckoutModule
    };
    switch (this.openedModalType) {
      case CheckoutPanelModalType.ClipboardCopy:
        config.headerConfig.title = this.translateService.translate('actions.copy_to_clipboard');
        config.component = CheckoutClipboardCopyComponent;
        break;
      case CheckoutPanelModalType.QR:
        config.headerConfig.title = this.translateService.translate('directLinkEditing.actions.qr');
        config.component = QRIntegrationComponent;
        break;
    }
    this.dialogRef = this.overlayService.open(config);
    this.dialogRef.afterClosed.subscribe(() => {
      this.link = null;
      this.openedModalType = null;
    });
  }
}
