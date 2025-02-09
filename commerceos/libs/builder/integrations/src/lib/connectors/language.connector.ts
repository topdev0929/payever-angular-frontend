import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { map, take } from 'rxjs/operators';

import { PebAPIDataSourceSchema, PebIntegrationAction } from '@pe/builder/core';

import { PebIntegrationAppNamesEnum } from '../constants';

import { PebBaseAppConnector } from './base-app.connector';

@Injectable()
export class PebLanguageConnector extends PebBaseAppConnector {
  id = 'languages-app';
  title = 'payever Language';

  protected app = PebIntegrationAppNamesEnum.Language;

  getDataSources(): Observable<PebAPIDataSourceSchema[]> {
    return of([]);
  }

  getActions(): Observable<PebIntegrationAction[]> {
    return this.context$.pipe(
      map(({ languages }) => {
        if (!languages) {
          return [];
        }

        const result: PebIntegrationAction[] = Object.values(languages).filter(lang => lang.active).map(lang => ({
          id: lang.key,
          connectorId: this.id,
          title: `Change to ${lang.title}`,
          method: `language.switch`,
          staticParams: { lang },
        }));

        if (result.length) {
          result.unshift({
            id: `default`,
            connectorId: this.id,
            title: 'Change to default',
            method: `language.switch`,
            staticParams: { lang: undefined },
          });
        }

        return result;
      }),
      take(1),
    ) ?? of([]);
  }

  getActionById(id: string): Observable<PebIntegrationAction | undefined> {
    return this.getActions().pipe(
      map(actions => actions.find(ac => ac.id === id)),
    );
  }
}
