import { Observable } from 'rxjs';

import { PebDynamicParams, PebIntegrationInput } from './integration.model';

export type PebIntegrationAction = {
  id: string;
  connectorId: string;
  uniqueTag?: string;

  title: string; // display title of action
  method: string; //snackbar.toggle, checkout.addToCart, fetch, ..., mock.....

  staticParams?: any;
  // static params to run action, (params will be merged this order: staticPrams-> dynamicParams-> userDynamicParams)

  dynamicParams?: PebDynamicParams; // this params will be evaluated on runtime by provided context
  onSuccess?: PebIntegrationAction;
  onError?: PebIntegrationAction;
  finally?: PebIntegrationAction;
  input?: PebIntegrationInput[]; // TODO : design mode to describe expected parameters
}

export interface PebActionSchema {
  connectorId: string;
  actionId: string;
  title: string;
  dynamicParams?: PebDynamicParams;
}

export type PebIntegrationServices =
  { [key: string]: ((...params: any) => Observable<any>) | PebIntegrationServices };
