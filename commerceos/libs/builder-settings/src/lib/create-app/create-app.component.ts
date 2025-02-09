import { HttpEventType } from '@angular/common/http';
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, Inject } from '@angular/core';
import { of } from 'rxjs';
import { filter, switchMap, takeUntil, tap } from 'rxjs/operators';

import { PeAppEnv } from '@pe/app-env';
import { PebAppsApi, PebEditorApi } from '@pe/builder/api';
import { PeDestroyService } from '@pe/common';
import { ConfirmScreenService, Headings } from '@pe/confirmation-screen';
import { TranslateService } from '@pe/i18n';
import { PE_OVERLAY_CONFIG, PE_OVERLAY_DATA, PeOverlayWidgetService } from '@pe/overlay-widget';
import { PebShopContainer } from '@pe/resources/shared';

@Component({
  selector: 'pe-create-app',
  templateUrl: './create-app.component.html',
  styleUrls: ['./create-app.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [
    PeDestroyService,
  ],
})
export class PeSettingsCreateAppComponent {
  shopId: string;
  errorMsg: string;
  isImageLoading: boolean;

  shopConfig = {
    shopName: '',
    shopImage: '',
  }

  constructor(
    private destroy$: PeDestroyService,
    private apiShop: PebAppsApi,
    @Inject(PE_OVERLAY_DATA) public appData: any,
    @Inject(PE_OVERLAY_CONFIG) public config: any,
    private overlay: PeOverlayWidgetService,
    private cdr: ChangeDetectorRef,
    private api: PebEditorApi,
    private translateService: TranslateService,
    public env: PeAppEnv,
    private confirmScreenService: ConfirmScreenService,
  ) {

    if (this.appData.id) {
      this.config.doneBtnTitle = 'Open';
      this.config.title = this.appData.name;
      this.shopConfig.shopName = this.appData.name;
      this.shopConfig.shopImage = this.appData.picture;
      this.shopId = this.appData.id;
      this.config.doneBtnCallback = () => {
        const paylod: {
          id: string,
          name?: string,
          picture?: string,
        } = {
          id: this.appData.id,
        };
        if (this.shopConfig.shopName !== this.appData.name) {
          paylod.name = this.shopConfig.shopName;
        }
        if (this.shopConfig.shopImage !== this.appData.picture) {
          paylod.picture = this.shopConfig.shopImage;
        }
        if (!this.errorMsg) {
          if (!paylod.picture && !paylod.name) {
            this.appData.isDefault ?
              this.openDashboard(this.appData) :
              this.apiShop.markAsDefault(this.appData.id).subscribe((data) => {
                this.openDashboard(data);
              });
          }
          else {
            this.apiShop.update(paylod).pipe(
              switchMap((shop) => {
                return this.appData.isDefault ?
                  of(this.openDashboard(shop)) :
                  this.apiShop.markAsDefault(this.appData.id).pipe(tap(data => this.openDashboard(data)));
              }),
            ).subscribe((data) => { }, (error) => {
              this.errorMsg = error.error.errors;
              this.cdr.markForCheck();
            });
          }
        }
      };

      return;
    }
    this.config.doneBtnTitle = 'Create';
    this.config.doneBtnCallback = () => {
      const payload: { name: string, picture?: string } = {
        name: this.shopConfig.shopName,
      };
      if (this.shopConfig.shopImage) {
        payload.picture = this.shopConfig.shopImage;
      }
      if (!this.errorMsg) {
        this.apiShop.create(payload).pipe(
          switchMap((data) => {
            this.appData.id = data.id;

            return this.apiShop.markAsDefault(data.id);
          }),
          tap((data) => {
            this.openDashboard(data);
          }),
        ).subscribe();
      }
    };
  }

  openDashboard(shop) {
    this.env.id = this.appData.id;
    this.appData.onSaved$.next({ openShop: true, shop });
    this.overlay.close();
  }

  validateShop(event) {
    const value = event.target.value;
    this.shopConfig.shopName = value;
    if (!this.validateName(value)) {
      this.errorMsg = value.length < 3 ? 'Name should have at least 3 characters' : 'Name is not correct';
      this.cdr.markForCheck();

      return;
    }
    this.apiShop.validateName(value).subscribe((data) => {
      this.errorMsg = data.message && value !== this.appData.name ? data.message : null;
      this.cdr.markForCheck();
    });
  }

  validateName(name: string) {
    return /^[a-zA-Z0-9][a-zA-Z0-9-]{1,61}[a-zA-Z0-9]$/.test(name);
  }

  private showConfirmationDialog() {
    const headings: Headings = {
      title: this.translateService.translate(`${this.env.type}-app.dialogs.window_exit.title`),
      subtitle: this.translateService.translate(`${this.env.type}-app.dialogs.delete-shop.label`),
      declineBtnText: this.translateService.translate(`${this.env.type}-app.dialogs.window_exit.decline`),
      confirmBtnText: this.translateService.translate(`${this.env.type}-app.dialogs.window_exit.confirm`),
    };

    return this.confirmScreenService.show(headings, true).pipe(
      filter(val => !!val),
      takeUntil(this.destroy$),
    );
  }

  removeShop() {
    this.showConfirmationDialog().pipe(
      tap(() => {
        this.apiShop.delete(this.appData.id).pipe(
          tap((data) => {
            this.appData.onSaved$.next({ updateShopList: true });
            this.overlay.close();
          }),
          takeUntil(this.destroy$)
        ).subscribe();
      }),
      takeUntil(this.destroy$)
      ).subscribe();
  }

  onLogoUpload($event: any) {
    this.isImageLoading = true;
    const files = $event;
    if (files.length > 0) {
      const file = files[0];
      const reader = new FileReader();
      reader.readAsDataURL(file);

      reader.onload = () => {
        this.api.uploadImageWithProgress(PebShopContainer.Images, file).pipe(
          takeUntil(this.destroy$),
          tap((event) => {
            switch (event.type) {
              case HttpEventType.UploadProgress: {
                this.cdr.detectChanges();
                break;
              }
              case HttpEventType.Response: {
                this.shopConfig.shopImage = event?.body?.blobName || reader.result as string;
                this.isImageLoading = false;
                this.cdr.detectChanges();
                break;
              }
              default:
                break;
            }
          }),
        ).subscribe();
      };
    }
  }

}
