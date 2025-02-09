import { Directive, Injector, OnInit } from '@angular/core';

import { ChannelSwitchListInterface, CheckoutChannelSetTypeEnum } from '../../interfaces';
import { StorageService } from '../../services';

import { BaseChannelsSwitchService } from './services/base-channels-switch.service';


@Directive()
export abstract class BaseChannelsSwitchAppDirective implements OnInit {
  protected storageService = this.injector.get(StorageService);
  protected baseChannelsSwitchService = this.injector.get(BaseChannelsSwitchService);

  protected checkoutUuid: string;
  protected terminalList: ChannelSwitchListInterface[];
  protected channelSetType: CheckoutChannelSetTypeEnum;

  constructor(protected injector: Injector) {}

  ngOnInit(): void {
    this.fetchTerminalList();
  }

  fetchTerminalList(): void {
    this.baseChannelsSwitchService
      .fetchTerminalList(this.checkoutUuid, this.channelSetType)
      .subscribe((terminalList: ChannelSwitchListInterface[]) => {
        this.terminalList = terminalList;
      });
  }

  toggleChannel(element: ChannelSwitchListInterface) {
    this.baseChannelsSwitchService.onChangeToggle(element, this.checkoutUuid).subscribe();
  }


}
