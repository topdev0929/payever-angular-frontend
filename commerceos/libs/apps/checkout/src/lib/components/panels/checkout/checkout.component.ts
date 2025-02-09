import { Component, Injector, OnDestroy, OnInit, ViewEncapsulation } from '@angular/core';
import { Observable, Subject, timer } from 'rxjs';
import { filter, first, map, switchMap, take, takeUntil, tap } from 'rxjs/operators';

import { PeOverlayConfig, PeOverlayRef, PeOverlayWidgetService } from '@pe/overlay-widget';
import { CheckoutSharedService } from '@pe/shared/checkout';
import { PeSimpleStepperService } from '@pe/stepper';

import { CheckoutPanelModalType } from '../../../interfaces';
import { PaymentLinksApiService } from '../../../payment-links';
import { EnvService, RootCheckoutWrapperService } from '../../../services';
import { CheckoutClipboardCopyComponent } from '../../checkout-clipboard-copy/checkout-clipboard-copy.component';
import { QRIntegrationComponent } from '../../qr-integration/qr-integration.component';
import { AbstractPanelComponent } from '../abstract-panel.component';

@Component({
  selector: 'panel-checkout',
  templateUrl: './checkout.component.html',
  styleUrls: ['./checkout.component.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class PanelCheckoutComponent extends AbstractPanelComponent implements OnDestroy, OnInit {
  createPrefilledLink$ = new Subject();

  link: string;
  dialogRef: PeOverlayRef;
  openedModalType: CheckoutPanelModalType;

  wrapperService: RootCheckoutWrapperService = this.injector.get(RootCheckoutWrapperService);
  paymentLinksApiService: PaymentLinksApiService = this.injector.get(PaymentLinksApiService);
  isShowCheckout$: Observable<boolean> = this.wrapperService.checkoutVisible$;

  qrIntegrationsInstalled$ = this.storageService.getCheckoutById(this.checkoutUuid).pipe(
    filter(v => !!v),
    switchMap(checkout => this.storageService.getCheckoutEnabledIntegrations(checkout._id)),
    filter(v => !!v),
    take(1),
    map(v => v.includes('qr')),
  )

  private peStepperService: PeSimpleStepperService = this.injector.get(PeSimpleStepperService);

  constructor(
    injector: Injector,
    private envService: EnvService,
    private overlayService: PeOverlayWidgetService,
    private checkoutSharedService: CheckoutSharedService,
  ) {
    super(injector);
  }

  ngOnInit(): void {
    super.ngOnInit();
    this.peStepperService.hide();

    this.wrapperService.setParams(this.wrapperService.defaultParams);
    this.wrapperService.cancelEmitted$.pipe(takeUntil(this.destroy$)).subscribe(() => {
      this.wrapperService.showCheckout(false);
    });
    this.wrapperService.showCheckout(true);

    if (this.activatedRoute?.snapshot?.data.modal && this.activatedRoute?.snapshot?.queryParams.link) {
      this.link = this.activatedRoute?.snapshot?.queryParams.link;
      this.openedModalType = this.activatedRoute.snapshot.data.modal;
      this.initModal();
    }


    this.createPrefilledLink$.pipe(
      switchMap(() => this.paymentLinksApiService.createLink({})),
      tap(({ id: paymentLinkId, redirectUrl }) => {
        this.wrapperService.preparePrefilled(() => {
          this.link = redirectUrl;
          this.openedModalType = CheckoutPanelModalType.ClipboardCopy;
          this.initModal();
        }, paymentLinkId);
      }),
      takeUntil(this.destroy$),
    ).subscribe();
  }

  ngOnDestroy(): void {
    this.wrapperService.showCheckout(false);
    this.wrapperService.reCreateFlow(); // Just resetting inputted data
    this.peStepperService.hide();
  }

  onOpenDirectLink(): void {
    this.storageService.getChannelSetsForCheckoutByTypeOnce(this.checkoutUuid, 'link').pipe(
      filter(channelSetIds => channelSetIds && channelSetIds.length > 0),
      switchMap(channelSetIds => this.checkoutSharedService.locale$.pipe(
        // Please do not remove timer(100), it is needed so that browsers do not block the opening of pop-ups
        switchMap(locale => timer(100).pipe(
          tap(() => window.open(
            this.storageService.makeCreateCheckoutLink(channelSetIds[0].id, locale),
            '_blank',
          ))
        ))
      )),
    ).subscribe();

  }

  copyLink() {
    this.wrapperService.getCopyLink().pipe(
      first(),
      tap((link) => {
        this.link = link;
        this.openedModalType = CheckoutPanelModalType.ClipboardCopy;
        this.initModal();
      }),
    ).subscribe();
  }

  copyLinkWithPrefilled() {
    this.createPrefilledLink$.next();
  }

  getQr() {
    this.wrapperService.preparePrefilled((link) => {
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
      },
      component: null,
    };
    switch (this.openedModalType) {
      case CheckoutPanelModalType.ClipboardCopy:
        config.headerConfig.title = this.translateService.translate('actions.copy_to_clipboard');
        config.component = CheckoutClipboardCopyComponent;
        break;
      case CheckoutPanelModalType.QR:
        config.headerConfig.title = this.translateService.translate('directLinkEditing.actions.qr');
        config.panelClass = 'connect-qr-modal';
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
