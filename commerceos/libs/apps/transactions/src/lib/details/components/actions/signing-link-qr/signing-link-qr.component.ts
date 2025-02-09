import { ChangeDetectionStrategy, Component, Inject, Injector, OnDestroy, OnInit } from '@angular/core';
import { BehaviorSubject, Observable, throwError } from 'rxjs';
import { catchError, filter, map, switchMap, takeUntil, tap } from 'rxjs/operators';

import { APP_TYPE, AppType, PePreloaderService } from '@pe/common';

import { ActionTypeEnum, GuarantorTypeEnum } from '../../../../shared';
import { AbstractAction } from '../../../../shared/abstractions';

export enum SigningLinkQRSectionsEnum {
  Customer = 'customer',
  Guarantor = 'guarantor'
}

@Component({
  selector: 'pe-signing-link-qr',
  templateUrl: './signing-link-qr.component.html',
  styleUrls: ['./signing-link-qr.component.scss', '../actions.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ActionSigningLinkQrComponent extends AbstractAction implements OnInit, OnDestroy {
  isLoadingQRCode$ = new BehaviorSubject<boolean>(true);

  activeSection$ = new BehaviorSubject<SigningLinkQRSectionsEnum>(SigningLinkQRSectionsEnum.Customer);
  SigningLinkQRSectionsEnum: typeof SigningLinkQRSectionsEnum = SigningLinkQRSectionsEnum;
  buttonTranslates = {
    customer: this.translateService.translate('transactions.form.signing_link_qr.buttons.contract_signer', {
      number: 1,
    }),
    guarantor: this.translateService.translate('transactions.form.signing_link_qr.buttons.contract_signer', {
      number: 2,
    }),
  }

  sectionQrData$: Observable<string>;
  isGuarantor$ = this.order$.pipe(
    map(order => order?.details?.guarantor_type && this.order?.details?.guarantor_type !== GuarantorTypeEnum.NONE)
  );

  constructor(
    protected injector: Injector,
    private pePreloaderService: PePreloaderService,
    @Inject(APP_TYPE) private appType: AppType,
  ) {
    super(injector);

    this.sectionQrData$ = this.isLoadingQRCode$.pipe(
      filter(d => !d),
      switchMap(() => this.activeSection$.pipe(
        map(section => section === SigningLinkQRSectionsEnum.Customer
          ? this.order.details?.customer_signing_link_qr
          : this.order.details?.guarantor_signing_link_qr)
      )),
    );
  }

  ngOnInit(): void {
    this.pePreloaderService.startLoading(this.appType);
    this.getData();
  }

  ngOnDestroy(): void {
    this.pePreloaderService.stopLoading(this.appType);
  }

  createForm(): void {
    this.loadQRCode();
  }

  toggleSigner(section: SigningLinkQRSectionsEnum): void {
    section && this.activeSection$.next(section);
  }

  private loadQRCode(): void {
    this.detailService.actionOrder(this.orderId, {}, ActionTypeEnum.SigningLinkQR, null, false).pipe(
      tap((data) => {
        this.isLoadingQRCode$.next(false);
      }),
      catchError((error) => {
        this.isLoadingQRCode$.next(false);
        this.showError(error);
        this.close();

        return throwError(error);
      }),
      takeUntil(this.destroy$)
    ).subscribe();
  }
}
