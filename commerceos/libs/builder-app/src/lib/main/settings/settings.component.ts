import {
  ChangeDetectorRef,
  Component,
  EventEmitter,
  OnInit,
  Output,
} from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { SelectSnapshot } from '@ngxs-labs/select-snapshot';
import { BehaviorSubject } from 'rxjs';
import { switchMap, takeUntil, tap } from 'rxjs/operators';

import { PeAppEnv } from '@pe/app-env';
import { PebAppsApi } from '@pe/builder/api';
import {
  PeSettingsConnectExistingComponent,
  PeSettingsCreateAppComponent,
  PeSettingsCustomerPrivacyComponent,
  PeSettingsFacebookPixelComponent,
  PeSettingsGoogleAnalyticsComponent,
  PeSettingsPasswordProtectionComponent,
  PeSettingsPayeverDomainComponent,
  PeSettingsPersonalDomainComponent,
  PeSettingsSocialImageComponent,
  PeSettingsSpamProtectionComponent,
} from '@pe/builder-settings';
import { BusinessInterface } from '@pe/business';
import { PeDestroyService } from '@pe/common';
import { ConfirmScreenService, Headings } from '@pe/confirmation-screen';
import { TranslateService } from '@pe/i18n';
import { PeOverlayConfig, PeOverlayWidgetService } from '@pe/overlay-widget';
import { BusinessState } from '@pe/user';


@Component({
  selector: 'pe-settings',
  templateUrl: './settings.component.html',
  styleUrls: [
    './settings.component.scss',
  ],
  providers: [PeDestroyService],
})
export class PeSettingsComponent implements OnInit {

  @SelectSnapshot(BusinessState.businessData) businessData!: BusinessInterface;

  openedShop;
  shopList;
  isLive: boolean;

  onSavedSubject$ = new BehaviorSubject(null);
  @Output() closeEvent = new EventEmitter<boolean>();

  components = {
    payeverDomain: {
      component: PeSettingsPayeverDomainComponent,
      header: `${this.appEnv.type}-app.settings.payever_domain`,
    },
    connectExisting: {
      component: PeSettingsConnectExistingComponent,
      header: `${this.appEnv.type}-app.settings.connect_existing`,
    },
    connectPersonal: {
      component: PeSettingsConnectExistingComponent,
      header: `${this.appEnv.type}-app.settings.personal_domain`,
    },
    createApp: {
      component: PeSettingsCreateAppComponent,
      header: `${this.appEnv.type}-app.actions.create_new`,
    },
    customerPrivacy: {
      component: PeSettingsCustomerPrivacyComponent,
      header: `${this.appEnv.type}-app.actions.customer_privacy`,
    },
    facebookPixel: {
      component: PeSettingsFacebookPixelComponent,
      header: `${this.appEnv.type}-app.actions.facebook_pixel`,
    },
    googleAnalytics: {
      component: PeSettingsGoogleAnalyticsComponent,
      header: `${this.appEnv.type}-app.actions.google_analytics`,
    },
    passwordProtection: {
      component: PeSettingsPasswordProtectionComponent,
      header: `${this.appEnv.type}-app.settings.password_protection`,
    },
    personalDomain: {
      component: PeSettingsPersonalDomainComponent,
      header: `${this.appEnv.type}-app.settings.personal_domain`,
    },
    socialImage: {
      component: PeSettingsSocialImageComponent,
      header: `${this.appEnv.type}-app.settings.social_image`,
    },
    spamProtection: {
      component: PeSettingsSpamProtectionComponent,
      header: `${this.appEnv.type}-app.settings.spam_protection`,
    },
  };

  constructor(
    public appEnv: PeAppEnv,
    private api: PebAppsApi,
    private route: ActivatedRoute,
    private router: Router,
    private overlay: PeOverlayWidgetService,
    private cdr: ChangeDetectorRef,
    private translateService: TranslateService,
    private destroy$: PeDestroyService,
    private confirmScreenService: ConfirmScreenService,
  ) {
  }

  toggleShopLive(e) {
    this.api.patchIsLive(this.openedShop.id, e).subscribe((data: any) => {
      this.openedShop.accessConfig = data;
      this.isLive = data.isLive;
    });
    this.cdr.markForCheck();
  }

  ngOnInit() {
    this.getList().subscribe();
    this.onSavedSubject$.asObservable().pipe(
      tap((data) => {
        if (data?.updateShopList) {
          this.getList().subscribe();
        }
        if (data?.openShop) {
          this.route.snapshot.parent.parent.data = { ...this.route.snapshot?.parent?.parent?.data, shop: data.shop };
          this.router.navigateByUrl(`business/${this.businessData._id}/${this.appEnv.type}/${data.shop.id}/dashboard`);
        }
        if (data?.connectExisting) {
          this.openOverlay(this.components.connectPersonal);
        }
      }),
      takeUntil(this.destroy$),
    ).subscribe();
  }

  onShopClick(shop) {
    if (shop.isDefault) {
      return;
    }
    this.api.markAsDefault(shop.id).pipe(
      switchMap(() => this.getList()),
    ).subscribe();
  }

  getList() {
    return this.api.getList().pipe(
      tap((shops) => {
        this.shopList = shops;
        shops.map((shop) => {
          if (shop.id === this.route.snapshot.params.app) {
            this.openedShop = shop;
            this.isLive = shop.accessConfig.isLive;
          }
        });
        this.cdr.markForCheck();
      }),
    );
  }

  openOverlay(item, itemData?: any) {
    const overlayData = itemData ?? this.openedShop;
    const config: PeOverlayConfig = {
      hasBackdrop: true,
      component: item.component,
      data: { ...overlayData, onSaved$: this.onSavedSubject$, closeEvent: this.closeEvent },
      backdropClass: 'settings-backdrop',
      panelClass: 'settings-widget-panel',
      headerConfig: {
        title: this.translateService.translate(item.header),
        backBtnTitle: this.translateService.translate(`${this.appEnv.type}-app.actions.cancel`),
        backBtnCallback: () => {
          this.showConfirmationDialog();
        },
        cancelBtnTitle: '',
        cancelBtnCallback: () => {
          this.showConfirmationDialog();
        },
        doneBtnTitle: this.translateService.translate(`${this.appEnv.type}-app.actions.done`),
        doneBtnCallback: () => {
        },
        removeContentPadding: true,
      },
      backdropClick: () => {
        this.showConfirmationDialog();
      },
    };

    this.overlay.open(config);
  }

  private showConfirmationDialog() {
    const headings: Headings = {
      title: this.translateService.translate(`${this.appEnv.type}-app.dialogs.window_exit.title`),
      subtitle: this.translateService.translate(`${this.appEnv.type}-app.dialogs.window_exit.label`),
      declineBtnText: this.translateService.translate(`${this.appEnv.type}-app.dialogs.window_exit.decline`),
      confirmBtnText: this.translateService.translate(`${this.appEnv.type}-app.dialogs.window_exit.confirm`),
    };

    this.confirmScreenService.show(headings, true).pipe(
      tap((val) => {
        if (val) {
          this.closeEvent.emit(true);
          this.overlay.close();
        }
        this.router.navigate(['.'], { relativeTo: this.route });
      }),
      takeUntil(this.destroy$),
    ).subscribe();
  }

}
