import { ChangeDetectionStrategy, Component, Inject, OnDestroy, OnInit } from '@angular/core';
import { takeUntil, tap } from 'rxjs/operators';

import { PeCouponsApi } from '../../../services/abstract.coupons.api';
import { PeOverlayRef, PE_OVERLAY_DATA } from '../../../misc/services/coupons-overlay/coupons-overlay.service';
import { PeFolder } from '../../../misc/interfaces/folder.interface';
import { AppThemeEnum, EnvService } from '@pe/common';
import { DestroyService } from '../../../misc/services/destroy.service';

@Component({
  selector: 'pe-folder-form',
  templateUrl: './delete-confirmation.dialog.html',
  styleUrls: ['./delete-confirmation.dialog.scss'],
  providers: [DestroyService],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PeDeleteConfirmationDialog implements OnInit {

  public selectedFolder: PeFolder;
  public theme = this.envService?.businessData?.themeSettings?.theme
  ? AppThemeEnum[this.envService.businessData.themeSettings.theme]
  : AppThemeEnum.default;

  constructor(
    private peOverlayRef: PeOverlayRef,
    private peApiService: PeCouponsApi,
    private envService: EnvService,
    @Inject(PE_OVERLAY_DATA) public overlayData: any,
    private readonly destroy$: DestroyService,
  ) {
  }

  ngOnInit() {
    this.selectedFolder = this.overlayData;
  }

  onClose(): void {
    this.peOverlayRef.close();
  }

  onSave() {
    this.peApiService.deleteCouponsFolder(this.selectedFolder._id).pipe(
      tap(() => this.peOverlayRef.close(true)),
      takeUntil(this.destroy$),
    ).subscribe();
  }

}
