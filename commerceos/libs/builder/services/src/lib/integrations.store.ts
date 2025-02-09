import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { map } from 'rxjs/operators';

export type PebIntegrationsStoreType = {
  integrations: [],
  dict: {
    integrations: { [id: string]: any },
    actions: { [id: string]: any },
    links: { [id: string]: any },
    interactions: { [id: string]: any },
  },
};

@Injectable()
export class PebEditorIntegrationsStore {

  private readonly integrationsStoreSubject = new BehaviorSubject<PebIntegrationsStoreType>({
    integrations: [], dict: { integrations: {}, actions: {}, links: {}, interactions: {} },
  });

  private get integrationsStore() {
    return this.integrationsStoreSubject.getValue();
  }

  readonly integrations$ = this.integrationsStoreSubject.asObservable().pipe(map(data => data.integrations));
  get integrations() {
    return this.integrationsStoreSubject.getValue().integrations;
  }

  getIntegrationByTag(tag: string ) {
    return undefined;
  }

  getIntegrationActionsByTags(
    integrationTag: string,
    actionTag: string,
  ) {
    return undefined;
  }

  getFirstIntegrationActionByTags(integrationTag: string, actionTag: string) {
    const actions = this.getIntegrationActionsByTags(integrationTag, actionTag);

    return actions.length ? actions[0] : null;
  }

  getActionIntegration(actionId: string) {
    return undefined;
  }
}
