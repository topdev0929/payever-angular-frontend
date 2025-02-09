import { Injectable } from '@angular/core';
import { EMPTY, forkJoin, merge, Observable } from 'rxjs';
import { map, shareReplay, takeUntil } from 'rxjs/operators';

import { PebConnectorContext } from '@pe/builder/core';
import { PeDestroyService } from '@pe/common';

import { PebIntegrationApiHandler, PebIntegrationMockHandler } from '../handlers';
import { PebIntegrationConnector } from '../interfaces/connector.interface';


@Injectable()
export class PebConnectorProxyService {
  private connectors: Map<string, PebIntegrationConnector> = new Map();
  private context$: Observable<PebConnectorContext> = EMPTY;

  constructor(
    private readonly destroy$: PeDestroyService,
    private readonly mockHandler: PebIntegrationMockHandler,
    private readonly apiHandler: PebIntegrationApiHandler,
  ) {
  }

  register(connector: PebIntegrationConnector | PebIntegrationConnector[]): this {
    if (Array.isArray(connector)) {
      connector.forEach(c => this.connectors.set(c.id, c));
    }
    else {
      this.connectors.set(connector.id, connector);
    }

    return this;
  }

  initAll(): Observable<boolean> {
    const connectors = Array.from(this.connectors.values());
    connectors.forEach(connector => connector.setContext(this.context$));

    const connectors$ = forkJoin(connectors.map(c => c.init())).pipe(
      map(result => !result.find(r => !r)),
      shareReplay(),
      takeUntil(this.destroy$)
    );

    const obs$ = merge(
      connectors$,
      this.apiHandler.init(),
      this.mockHandler.init(),
    );

    obs$.subscribe();

    return obs$;
  }

  setContext(context$: Observable<PebConnectorContext>) {
    this.context$ = context$;
    const connectors = Array.from(this.connectors.values());
    connectors.forEach(connector => connector.setContext(this.context$));
  }

  getConnector(id: string | undefined): PebIntegrationConnector | undefined {
    return id ? this.connectors.get(id) : undefined;
  }

  getAll(): PebIntegrationConnector[] {
    return [...this.connectors.values()];
  }
}
