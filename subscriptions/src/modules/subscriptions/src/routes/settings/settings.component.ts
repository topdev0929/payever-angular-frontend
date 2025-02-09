import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  Inject,
  OnInit,
  ViewEncapsulation,
} from '@angular/core';
import { MatIconRegistry } from '@angular/material/icon';
import { DomSanitizer } from '@angular/platform-browser';
import { catchError, takeUntil, tap } from 'rxjs/operators';
import { BehaviorSubject } from 'rxjs';

import { PeOverlayConfig, PeOverlayWidgetService } from '@pe/overlay-widget';
import { AppThemeEnum, EnvService } from '@pe/common';

import { AbstractComponent } from '../../shared/abstract';
import { PeSettingsApi } from '../../api/settings/abstract.settings.api';
import { PeSettingsPayeverDomainComponent } from './payever-domain/payever-domain.component';
import { PeSettingsPersonalDomainComponent } from './personal-domain/personal-domain.component';
import { PeSettingsConnectExistingComponent } from './connect-existing/connect-existing.component';
import { PeSubscriptionsModule } from '../../subscriptions.module';
import { SubscriptionEnvService } from '../../api/subscription/subscription-env.service';

@Component({
  selector: 'pe-settings',
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
})
export class PeSettingsComponent extends AbstractComponent implements OnInit {
  openedSubscription;
  theme = AppThemeEnum.default;
  isLive = false;

  components = {
    payeverDomain: {
      component: PeSettingsPayeverDomainComponent,
      header: 'Payever Domain',
    },
    personalDomain: {
      component: PeSettingsPersonalDomainComponent,
      header: 'Personal Domain',
    },
    connectExisting: {
      component: PeSettingsConnectExistingComponent,
      header: 'Connect existing domain',
    },
  };
  onSavedSubject$ = new BehaviorSubject(null);
  constructor(
    private cdr: ChangeDetectorRef,
    private matIconRegistry: MatIconRegistry,
    private domSanitizer: DomSanitizer,
    private settingsApi: PeSettingsApi,
    private overlay: PeOverlayWidgetService,
    @Inject(EnvService) private envService: SubscriptionEnvService,
  ) {
    super();

    this.matIconRegistry.addSvgIcon(
      `arrow-open`,
      this.domSanitizer.bypassSecurityTrustResourceUrl('assets/icons/arrow-right-open.svg'),
    );
    this.matIconRegistry.addSvgIcon(
      `livestatus`,
      this.domSanitizer.bypassSecurityTrustResourceUrl('assets/icons/livestatus-icon-settings.svg'),
    );
    this.matIconRegistry.addSvgIcon(
      `owndomain`,
      this.domSanitizer.bypassSecurityTrustResourceUrl('assets/icons/owndomain-icon-settings.svg'),
    );
  }

  ngOnInit(): void {
    this.getBillingSubscriptionAccess();

    this.onSavedSubject$
      .asObservable()
      .pipe(
        tap((data) => {
          if (data?.updateSubscriptionAccess) {
            this.getBillingSubscriptionAccess();
          }

          if (data?.connectExisting) {
            this.openOverlay(this.components.connectExisting);
          }
        }),
        takeUntil(this.destroyed$),
      )
      .subscribe();
  }

  getBillingSubscriptionAccess() {
    this.settingsApi
      .getBillingSubscriptionAccess(this.envService.applicationId)
      .pipe(
        tap((data: any) => {
          this.openedSubscription = data;
          this.isLive = data.isLive;
          this.cdr.detectChanges();
        }),
        catchError((err) => {
          throw new Error(err);
        }),
      )
      .subscribe();
  }

  openOverlay(item, itemData?: any) {
    const overlayData = itemData ? itemData : this.openedSubscription;
    const config: PeOverlayConfig = {
      lazyLoadedModule: PeSubscriptionsModule,
      hasBackdrop: true,
      component: item.component,
      data: { ...overlayData, onSved$: this.onSavedSubject$ },
      backdropClass: 'settings-backdrop',
      panelClass: 'settings-widget-panel',
      headerConfig: {
        title: item.header,
        backBtnTitle: 'Cancel',
        theme: this.theme,
        backBtnCallback: () => {
          this.overlay.close();
        },
        cancelBtnTitle: '',
        cancelBtnCallback: () => {},
        doneBtnTitle: 'Done',
        doneBtnCallback: () => {},
      },
    };

    this.overlay.open(config);
  }
}
