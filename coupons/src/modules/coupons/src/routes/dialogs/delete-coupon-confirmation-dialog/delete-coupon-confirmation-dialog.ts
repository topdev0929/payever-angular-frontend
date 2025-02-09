import { ChangeDetectionStrategy, Component, Inject, OnDestroy, OnInit } from '@angular/core';
import { takeUntil, tap } from 'rxjs/operators';

import { AppThemeEnum, EnvService } from '@pe/common';

import { PeCouponsApi } from '../../../services/abstract.coupons.api';
import { PeOverlayRef, PE_OVERLAY_DATA } from '../../../misc/services/coupons-overlay/coupons-overlay.service';
import { DestroyService } from '../../../misc/services/destroy.service';

@Component({
  selector: 'pe-coupon-delete-form',
  templateUrl: './delete-coupon-confirmation-dialog.html',
  styleUrls: ['../delete-confirmation-dialog/delete-confirmation.dialog.scss'],
  providers: [DestroyService],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PeDeleteCouponConfirmationDialog implements OnInit {
  public theme = this.envService?.businessData?.themeSettings?.theme
  ? AppThemeEnum[this.envService.businessData.themeSettings.theme]
  : AppThemeEnum.default;

  selectedCouponsIds: string[];

  constructor(
    private peOverlayRef: PeOverlayRef,
    private peApiService: PeCouponsApi,
    private envService: EnvService,
    @Inject(PE_OVERLAY_DATA) public overlayData: any,
    private readonly destroy$: DestroyService,
  ) {
  }

  ngOnInit() {
    this.selectedCouponsIds = this.overlayData;
  }

  onClose(): void {
    this.peOverlayRef.close();
  }

  onSave() {
    this.selectedCouponsIds.map((couponId) => {
      this.peApiService.deleteCoupon(couponId).pipe(
            tap(() => this.peOverlayRef.close(true)),
            takeUntil(this.destroy$),
          ).subscribe();
    });

  }

}
