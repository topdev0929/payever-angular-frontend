import { Injectable } from '@angular/core';
import { Resolve } from '@angular/router';
import { Observable } from 'rxjs';
import { switchMap } from 'rxjs/operators';
import { ApiService, EnvService, StorageService } from '../services';
import { BaseWidgetSettingsInterface, CheckoutChannelSetInterface, CheckoutInterface } from '../interfaces';

@Injectable()
export class ChannelWidgetDataResolver implements Resolve<BaseWidgetSettingsInterface> {

  constructor(private apiService: ApiService,
              private envService: EnvService,
              private storageService: StorageService) {}

  resolve(): Observable<BaseWidgetSettingsInterface> {
    let channelSetId: string;
    this.storageService.getDefaultCheckoutOnce().pipe( // TODO Do we need current or default?
      switchMap((checkout: CheckoutInterface) => {
        return this.storageService.getChannelSetsForCheckoutOnce(checkout._id);
      })
    ).subscribe((channelSets: CheckoutChannelSetInterface[]) => {
      channelSetId = channelSets.find((channelSet: CheckoutChannelSetInterface) => channelSet.type === 'finance_express').id;
    });

    return null; // this.apiService.getWidgetSettings(channelSetId);
  }
}
