import { Injectable, inject } from '@angular/core';
import {
  Action,
  Selector,
  SelectorOptions,
  State,
  StateContext,
} from '@ngxs/store';
import { switchMap } from 'rxjs/operators';

import { ApiService } from '@pe/checkout/api';
import {
  CheckoutBaseSettingsInterface,
  CheckoutSettingsInterface,
  CheckoutUISettingsInterface,
} from '@pe/checkout/types';

import { GetSettings, InitSettings, SetSettings } from './settings.actions';

@State<CheckoutSettingsInterface>({
  name: 'settings',
  defaults: null,
})
@SelectorOptions({
  injectContainerState: false,
  suppressErrors: false,
})
@Injectable()
export class SettingsState {

  private apiService = inject(ApiService);

  @Selector() static settings(state: CheckoutSettingsInterface) {
    return state;
  }

  @Selector() static baseSettings(state: CheckoutSettingsInterface): CheckoutBaseSettingsInterface {
    return {
      businessUuid: state.businessUuid,
      channelType: state.channelType,
      currency: state.currency,
      customPolicy: state.customPolicy,
      languages: state.languages,
      logo: state.logo,
      message: state.message,
      name: state.name,
      paymentMethods: state.paymentMethods,
      phoneNumber: state.phoneNumber,
      policyEnabled: state.policyEnabled,
      testingMode: state.testingMode,
      uuid: state.uuid,
      companyAddress: state.companyAddress,
    };
  }

  @Selector() static uiSettings(state: CheckoutSettingsInterface): CheckoutUISettingsInterface {
    return {
      logo: state.logo,
      sections: state.sections,
      styles: state.styles,
      uuid: state.uuid,
    };
  }

  @Action(InitSettings)
  initSettings(
    { setState }: StateContext<CheckoutSettingsInterface>,
    { settings }: InitSettings,
  ) {
    setState({ ...settings });
  }

  @Action(GetSettings, { cancelUncompleted: true })
  getSettings({ getState, dispatch }: StateContext<CheckoutSettingsInterface>, action: GetSettings) {
    const settings = action.bypassCacheFlag ? undefined : getState();

    return settings || this.apiService.getFlowSettingsFull(action.channelSetId).pipe(
      switchMap(settings => dispatch(new SetSettings(settings))),
    );
  }

  @Action(SetSettings)
  setSettings({ setState }: StateContext<CheckoutSettingsInterface>, action: SetSettings) {
    setState({ ...action.payload });
  }
}
