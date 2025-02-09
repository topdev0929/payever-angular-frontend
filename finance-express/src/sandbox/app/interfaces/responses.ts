import { ChannelsSets } from './channels-sets';
import { Currencies } from './currency';
import { CurrenciesLimits } from './currency-limit';
import { OverlayApp } from './overlay-app';

export namespace Responses {

  export type GetOverlayApps = OverlayApp[];

  export type PostSettings = null;

  export type GetChannelsSet = ChannelsSets;

  export type PatchChannelsSet = null;

  export type GetCurrencies = Currencies;

  export type GetCurrenciesLimits = CurrenciesLimits;

}
