import { ChangeDetectionStrategy, Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { DomSanitizer } from '@angular/platform-browser';
import { map, share } from 'rxjs/operators';

import { DialogComponentInterface, DialogRef } from '@pe/checkout/dialog';
import { CustomElementService } from '@pe/checkout/utils';

import { ShareBagService } from '../../services/share-bag.service';

@Component({
  selector: 'share-bag',
  templateUrl: './share-bag.component.html',
  styleUrls: ['./share-bag.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ShareBagComponent implements DialogComponentInterface {
  dialogRef: DialogRef<ShareBagComponent>;

  qr$ = this.shareBagService.getQrCode(this.data.flow, this.data.openNextStep).pipe(
    map((blob: any) => {
      const url = URL.createObjectURL(blob);

      return this.domSanitizer.bypassSecurityTrustUrl(url);
    }),
  );

  restoreUrl$ = this.shareBagService.restoreUrl$.pipe(
    share(),
  );

  translations = {
    title: $localize `:@@checkout_sdk.qr_share.title:`,
    cancel: $localize `:@@checkout_sdk.qr_share.cancel:Cancel`,
  };

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: any,
    private shareBagService: ShareBagService,
    private domSanitizer: DomSanitizer,
    private customElementService: CustomElementService,
  ) {
    (window as any).PayeverStatic?.SvgIconsLoader?.loadIcons(
      ['close-16-bold'],
      null,
      this.customElementService.shadowRoot,
    );
  }

  close(): void {
    this.dialogRef.close();
  }
}
