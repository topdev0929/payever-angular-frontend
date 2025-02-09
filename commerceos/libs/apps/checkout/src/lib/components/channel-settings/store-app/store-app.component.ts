import { Component, ViewEncapsulation } from '@angular/core';
import { Router } from '@angular/router';

import { PeDestroyService } from '@pe/common';
import { PE_OVERLAY_DATA } from '@pe/overlay-widget';

import { ChannelSwitchListInterface, CheckoutChannelSetTypeEnum } from '../../../interfaces';
import { BaseChannelsSwitchAppDirective } from '../base-channels-switch-app.directive';

@Component({
  selector: 'shop-app',
  templateUrl: './store-app.component.html',
  styleUrls: ['./store-app.component.scss'],
  encapsulation: ViewEncapsulation.None,
  providers: [PeDestroyService],
})
export class ShopAppComponent extends BaseChannelsSwitchAppDirective {
  private router = this.injector.get(Router);
  private overlayData = this.injector.get(PE_OVERLAY_DATA);

  terminalList: ChannelSwitchListInterface[];
  checkoutUuid = this.overlayData.checkoutUuid;
  channelSetType = CheckoutChannelSetTypeEnum.SHOP;

  goBack() {
    this.router.navigate([this.storageService.getHomeChannelsUrl(this.checkoutUuid)]);
  }
}
