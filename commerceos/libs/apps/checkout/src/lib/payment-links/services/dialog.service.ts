import { Injectable, OnDestroy } from "@angular/core";
import { merge, Subject } from "rxjs";
import { takeUntil, tap } from "rxjs/operators";

import { TranslateService } from "@pe/i18n-core";
import { PeOverlayConfig, PeOverlayRef, PeOverlayWidgetService } from "@pe/overlay-widget";

import { EditPaymentLinkComponent, PaymentLinkPrefillComponent, ShareLinkComponent } from "../components";
import { LinkActionsEnum } from "../components";


export type Action = {
  paymentLinkId: string,
  type: LinkActionsEnum,
  link?: string,
  businessName?: string,
  businessUuid?: string,
}

@Injectable()
export class PaymentLinkDialogService implements OnDestroy {
  private createNewLinkOverlayRef: PeOverlayRef;
  private prefillOverlayRef: PeOverlayRef;
  public openAction$ = new Subject<Action>()
  private destroy$ = new Subject<void>();

  constructor(
    private peOverlayWidgetService: PeOverlayWidgetService,
    private translateService: TranslateService,
  ) {
    merge(
      this.openAction$.pipe(tap((action: Action) => this.openAction(action))),
    ).pipe(takeUntil(this.destroy$)).subscribe();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  createOrPatchLink(paymentLinkId: string = null) {
    const doneBtnSubject$ = new Subject<void>();
    const cancelSubject$ = new Subject<void>();
    const cancel = () => {
      cancelSubject$.next();
    };

    const config: PeOverlayConfig = {
      backdropClass: 'payment-link-dialog-backdrop',
      panelClass: 'payment-link-dialog',
      hasBackdrop: true,
      backdropClick: cancel,
      data: {
        paymentLinkId,
        onSave$: doneBtnSubject$.asObservable(),
        onCancel$: cancelSubject$.asObservable(),
        close: () => {
          this.createNewLinkOverlayRef.close();
        },
        openAction$: this.openAction$,
      },
      headerConfig: {
        backBtnTitle: this.translateService.translate('actions.cancel'),
        doneBtnCallback: () => {
          doneBtnSubject$.next();
        },
        backBtnCallback: cancel,
        doneBtnTitle: this.translateService.translate('actions.done'),
        title: this.translateService.translate(`paymentLinks.dialog.title.${paymentLinkId ? 'edit' : 'create'}`),
      },
      component: EditPaymentLinkComponent,
    };

    this.createNewLinkOverlayRef = this.peOverlayWidgetService.open(config);
  }

  private openAction({ type, paymentLinkId, ...data }: Action) {
    const onSaveSubject$ = new Subject<void>();
    const cancelSubject$ = new Subject<void>();
    const cancel = () => {
      cancelSubject$.next();
    };

    const config: PeOverlayConfig = {
      backdropClass: 'prefill-payment-dialog-backdrop',
      hasBackdrop: true,
      backdropClick: cancel,
      data: {
        paymentLinkId,
        onSave$: onSaveSubject$.asObservable(),
        onCancel$: cancelSubject$.asObservable(),
        close: () => {
          this.prefillOverlayRef.close();
        },
        ...data,
      },
      headerConfig: {
        backBtnTitle: this.translateService.translate('actions.cancel'),
        doneBtnCallback: () => {
          onSaveSubject$.next();
        },
        backBtnCallback: cancel,
        doneBtnTitle: this.translateService.translate('actions.save'),
        title: this.translateService.translate('paymentLinks.dialog.title.prefill'),
      },
      component: null,
    };

    switch (type) {
      case LinkActionsEnum.share:
        config.component = ShareLinkComponent;
        config.headerConfig.title = this.translateService.translate('paymentLinks.sections.share');
        break;
      case LinkActionsEnum.prefill:
        config.panelClass = 'prefill-payment-dialog';
        config.component = PaymentLinkPrefillComponent;
        config.headerConfig.title =this.translateService.translate('paymentLinks.dialog.title.prefill');
        break;
    }

    this.prefillOverlayRef = this.peOverlayWidgetService.open(config);
  }
}
