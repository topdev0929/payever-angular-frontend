import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormControl } from '@angular/forms';
import { Router } from '@angular/router';
import { takeUntil, tap } from 'rxjs/operators';

import { PebEnvService } from '@pe/builder/core';
import { PeDestroyService, NavigationService } from '@pe/common';
import { TranslateService } from '@pe/i18n-core';
import { PeMessageSubscription } from '@pe/message/shared';
import { PE_OVERLAY_DATA } from '@pe/overlay-widget';
import { PeMessageIntegration } from '@pe/shared/chat';

@Component({
  selector: 'pe-message-subscription-list',
  templateUrl: './message-subscription-list.component.html',
  styleUrls: ['./message-subscription-list.component.scss'],
  providers: [PeDestroyService],
})
export class PeMessageSubscriptionListComponent implements OnInit {

  peMessageIntegration = PeMessageIntegration;

  formGroup = this.formBuilder.group({});
  messageAppColor = '';

  constructor(
    private navigationService: NavigationService,
    private router: Router,
    private destroyed$: PeDestroyService,
    private formBuilder: FormBuilder,
    private translateService: TranslateService,
    public envService: PebEnvService,
    @Inject(PE_OVERLAY_DATA) public peOverlayData: any,
  ) {
    (window as any)?.PayeverStatic?.SvgIconsLoader?.loadIcons([
      'social-whatsapp-12',
      'social-facebook-12',
      'social-live-chat-12',
      'social-telegram-18',
      'social-instagram-12',
    ]);
  }

  ngOnInit(): void {
    this.peOverlayData.subscriptionList.map((subscription: PeMessageSubscription) => {
      this.formGroup.addControl(subscription.integration.name, new FormControl(subscription.enabled));
    });

    this.formGroup.valueChanges.pipe(
      tap((value) => {
        this.peOverlayData.changes = value;
      }),
      takeUntil(this.destroyed$)
    ).subscribe();
  }

  getLabel(name: string): string {
    return this.translateService.translate(`message-app.message-integration.types.${name}`) ?? '';
  }

  add() {
    this.peOverlayData.close();
    this.navigationService.saveReturn(this.router.url);
    this.router.navigate([
      `/business/${this.envService.businessId}/connect`,
    ], { queryParams: { integrationName: 'messaging' } });
  }

  openIntegration(subscription: PeMessageSubscription) {
    const integration = subscription.integration;
    this.peOverlayData.close();
        this.navigationService.saveReturn(this.router.url);
        this.router.navigate([
          `/business/${this.envService.businessId}/connect`,
        ], { queryParams: { integration: integration.name, integrationCategory: integration.category } });
  }
}
