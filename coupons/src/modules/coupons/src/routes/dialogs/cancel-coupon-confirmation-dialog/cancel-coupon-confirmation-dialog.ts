import { ChangeDetectionStrategy, Component, Inject, OnDestroy, OnInit } from '@angular/core';
import { PeOverlayRef } from '../../../misc/services/coupons-overlay/coupons-overlay.service';
import { AppThemeEnum, EnvService } from '@pe/common';

@Component({
  selector: 'pe-coupon-cancel-form',
  templateUrl: './cancel-coupon-confirmation-dialog.html',
  styleUrls: ['../delete-confirmation-dialog/delete-confirmation.dialog.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PeCancelCouponConfirmationDialog implements OnInit {
  public theme = this.envService?.businessData?.themeSettings?.theme
  ? AppThemeEnum[this.envService.businessData.themeSettings.theme]
  : AppThemeEnum.default;

  constructor(
    private peOverlayRef: PeOverlayRef,
    private envService: EnvService,
  ) {
  }

  ngOnInit() {
  }

  onClose(): void {
    this.peOverlayRef.close();
  }

  onSave() {
    this.peOverlayRef.close(true);
  }

}
