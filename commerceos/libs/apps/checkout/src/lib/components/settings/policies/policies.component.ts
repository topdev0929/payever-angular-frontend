import { Component, Inject, Injector, OnInit, ViewEncapsulation } from '@angular/core';
import { EMPTY, iif, merge } from 'rxjs';
import { catchError, map, shareReplay, skip, switchMap, takeUntil, tap } from 'rxjs/operators';

import { PeDestroyService } from '@pe/common';
import { TranslateService } from '@pe/i18n';
import { PE_OVERLAY_DATA } from '@pe/overlay-widget';

import { ChannelSwitchListInterface, CheckoutInterface, CheckoutSettingsInterface } from '../../../interfaces';
import { StorageService } from '../../../services';
import { BaseSettingsComponent } from '../base-settings.component';

enum ToggleTypeEnum {
  PayeverTerms = 'payeverTerms',
  ChannelSets = 'channelSets',
}

@Component({
  selector: 'checkout-policies',
  templateUrl: './policies.component.html',
  styleUrls: ['./policies.component.scss'],
  encapsulation: ViewEncapsulation.None,
  providers: [PeDestroyService],
})
export class PoliciesComponent extends BaseSettingsComponent implements OnInit {
  checkoutUuid = this.overlayData.checkoutUuid;
  currentCheckoutConfig: CheckoutInterface;
  toggleType: typeof ToggleTypeEnum = ToggleTypeEnum;

  channelSetsList$ = this.storageService.getChannelSetsForCheckoutOnce(this.checkoutUuid).pipe(
    map(channelSets => channelSets.map(channelSet => ({
      id: channelSet.id,
      name: channelSet.name || this.translateService.translate(`channelSetDefaultNames.${channelSet.type}`),
      active: channelSet.policyEnabled,
    }))),
    shareReplay(1),
  );

  enablePayeverTerms: ChannelSwitchListInterface = {
    id: 'enablePayeverTerms',
    name: this.translateService.translate('settings.policies.labels.enablePayeverTerms'),
    active: false,
  }

  payeverTerms$ = this.storageService.getCheckoutByIdOnce(this.checkoutUuid).pipe(
    map((checkout: CheckoutInterface) => {
      this.currentCheckoutConfig = checkout;

      this.enablePayeverTerms.active = checkout.settings?.enablePayeverTerms ?? false;

      return [
        {
          id: 'enableLegalPolicy',
          name: this.translateService.translate('settings.policies.labels.enableLegalPolicy'),
          active: checkout.settings?.enableLegalPolicy ?? false,
        },
        {
          id: 'enableDisclaimerPolicy',
          name: this.translateService.translate('settings.policies.labels.enableDisclaimerPolicy'),
          active: checkout.settings?.enableDisclaimerPolicy ?? false,
        },
        {
          id: 'enableRefundPolicy',
          name: this.translateService.translate('settings.policies.labels.enableRefundPolicy'),
          active: checkout.settings?.enableRefundPolicy ?? false,
        },
        {
          id: 'enableShippingPolicy',
          name: this.translateService.translate('settings.policies.labels.enableShippingPolicy'),
          active: checkout.settings?.enableShippingPolicy ?? false,
        },
        {
          id: 'enablePrivacyPolicy',
          name: this.translateService.translate('settings.policies.labels.enablePrivacyPolicy'),
          active: checkout.settings?.enablePrivacyPolicy ?? false,
        },
      ];
    }),
    shareReplay(1),
  );

  constructor(
    injector: Injector,
    private storageService: StorageService,
    public translateService: TranslateService,
    @Inject(PE_OVERLAY_DATA) public overlayData: any
  ) {
    super(injector);
  }

  ngOnInit(): void {
    merge(
      this.overlayData.onSave$.pipe(skip(1)),
      this.overlayData.onClose$.pipe(skip(1)),
    ).pipe(
      tap(() => {
        this.overlayData.close();
      }),
      takeUntil(this.destroy$),
    ).subscribe();
  }

  onChangeToggle(value: boolean, element: ChannelSwitchListInterface, type: ToggleTypeEnum): void {
    const newSettings: CheckoutSettingsInterface = {
      ...this.currentCheckoutConfig.settings,
      [element.id]: value,
    };

    this.currentCheckoutConfig.settings = newSettings;

    this.storageService.getCheckoutByIdOnce(this.checkoutUuid).pipe(
      switchMap(() => {
        return iif(
          () => type === ToggleTypeEnum.ChannelSets,
          this.storageService.patchChannelSet(element.id, value).pipe(
            catchError((err) => {
              this.showError(err
                ? this.translateService.translate(err.message)
                : this.translateService.translate('settings.policies.notPossibleSave'));
              element.active = !value;

              return EMPTY;
            })
          ),
          this.storageService.saveCheckoutSettings(this.checkoutUuid, newSettings).pipe(
            catchError((err) => {
              this.storageService.showError(err);

              return EMPTY;
            }),
          ),
        );
      }),
    ).subscribe();
  }

  goBack(): void {
    this.router.navigate(['../../panel-settings'], { relativeTo: this.activatedRoute });
  }
}
