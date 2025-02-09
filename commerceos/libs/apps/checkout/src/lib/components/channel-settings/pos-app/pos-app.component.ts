import { Component, ViewEncapsulation } from '@angular/core';
import { Router } from '@angular/router';

import { PeDestroyService } from '@pe/common';
import { PE_OVERLAY_DATA } from '@pe/overlay-widget';

import { ChannelSwitchListInterface, CheckoutChannelSetTypeEnum } from '../../../interfaces';
import { BaseChannelsSwitchAppDirective } from '../base-channels-switch-app.directive';

@Component({
  selector: 'pos-app',
  templateUrl: './pos-app.component.html',
  styleUrls: ['./pos-app.component.scss'],
  encapsulation: ViewEncapsulation.None,
  providers: [PeDestroyService],
})
export class PosAppComponent extends BaseChannelsSwitchAppDirective {
  private router = this.injector.get(Router);
  private overlayData = this.injector.get(PE_OVERLAY_DATA);

  terminalList: ChannelSwitchListInterface[];
  checkoutUuid = this.overlayData.checkoutUuid;
  channelSetType = CheckoutChannelSetTypeEnum.POS;

  goBack() {
    this.router.navigate([this.storageService.getHomeChannelsUrl(this.checkoutUuid)]);
  }
}
