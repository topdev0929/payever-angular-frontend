import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { takeUntil, tap } from 'rxjs/operators';

import { PeOverlayConfig, PeOverlayWidgetService } from '@pe/overlay-widget';
import { TranslateService } from '@pe/i18n-core';
import { PeDestroyService } from '@pe/common';

import { PeMessageSubscription } from '../../../interfaces';
import { PeMessageApiService, PeMessageService } from '../../../services';

import { PeMessageSubscriptionListComponent } from '../message-subscription-list';

@Component({
  selector: 'pe-message-connect-root',
  templateUrl: './message-connect-root.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [PeDestroyService],
})
export class PeMessageConnectRootComponent implements OnInit {

  theme = 'dark';

  constructor(
    private peMessageService: PeMessageService,
    private peMessageApiService: PeMessageApiService,
    private translateService: TranslateService,
    private peOverlayWidgetService: PeOverlayWidgetService,
    private router: Router,
    private route: ActivatedRoute,
    private destroyed$: PeDestroyService,
  ) { }

  ngOnInit(): void {
    this.peMessageApiService.getSubscriptionList().pipe(
      tap(() => {
        this.openSubscriptionListOverlay();
      }),
      takeUntil(this.destroyed$),
    ).subscribe();
  }

  private openSubscriptionListOverlay(): void {
    const peOverlayConfig: PeOverlayConfig = {
      data: {
        subscriptionList: this.peMessageService.subscriptionList,
      },
      hasBackdrop: true,
      backdropClick: () => {
        this.router.navigate(['../'], { relativeTo: this.route });
        this.peOverlayWidgetService.close();
      },
      headerConfig: {
        title: this.translateService.translate('message-app.sidebar.connect'),
        theme: this.theme,
        backBtnTitle: this.translateService.translate('message-app.sidebar.cancel'),
        backBtnCallback: () => {
          this.router.navigate(['../'], { relativeTo: this.route });
          this.peOverlayWidgetService.close();
        },
        doneBtnTitle: this.translateService.translate('message-app.sidebar.done'),
        doneBtnCallback: () => {
          peOverlayConfig.data.subscriptionList.forEach((subscription: PeMessageSubscription) => {
            const name = subscription.integration.name;
            const changes = peOverlayConfig.data.changes;

            if (changes && subscription.enabled !== changes[name]) {
              this.toggleSubscription(name, changes[name]);
            }
          });

          this.router.navigate(['../'], { relativeTo: this.route });
          this.peOverlayWidgetService.close();
        },
      },
      panelClass: 'pe-message-overlay-subscription-list',
      component: PeMessageSubscriptionListComponent,
    };

    this.peOverlayWidgetService.open(peOverlayConfig);
  }

  private toggleSubscription(integrationName: string, enabled: boolean): void {
    const request = enabled ? this.peMessageApiService.patchSubscriptionInstall(integrationName)
      : this.peMessageApiService.patchSubscriptionUninstall(integrationName);
    request.pipe(
      tap(() => {
        const foundSubscription = this.peMessageService.subscriptionList.find(s => s.integration.name === integrationName);
        if (foundSubscription) {
          foundSubscription.enabled = enabled;
        }
      }),
      takeUntil(this.destroyed$),
    ).subscribe();
  }
}
