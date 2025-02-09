import { ChangeDetectionStrategy, ChangeDetectorRef, Component, Inject, OnDestroy, OnInit } from '@angular/core';
import { PeOverlayRef, PE_OVERLAY_DATA } from '../../../misc/services/coupons-overlay/coupons-overlay.service';
import { AppThemeEnum, EnvService } from '@pe/common';
import { DestroyService } from '../../../misc/services/destroy.service';


@Component({
  selector: 'pe-info-dialog',
  templateUrl: './info.dialog.html',
  styleUrls: ['./info.dialog.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PeInfoDialog implements OnInit {
  public theme = this.envService?.businessData?.themeSettings?.theme
  ? AppThemeEnum[this.envService.businessData.themeSettings.theme]
  : AppThemeEnum.default;

  public infoText: string;
  public title : string;

  constructor(
    private peOverlayRef: PeOverlayRef,
    private envService: EnvService,
    @Inject(PE_OVERLAY_DATA) public overlayData: any,
  ) {
  }

  ngOnInit() {
    this.infoText = this.overlayData.infoText;
    this.title = this.overlayData.title;
  }

  onClose(): void {
    this.peOverlayRef.close();
  }

}
