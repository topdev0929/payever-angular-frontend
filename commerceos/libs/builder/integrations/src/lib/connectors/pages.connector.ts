import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { switchMap, take } from 'rxjs/operators';

import { PebIntegrationAppNamesEnum } from '../constants';

import { PebBaseAppConnector } from './base-app.connector';

@Injectable()
export class PebPagesConnector extends PebBaseAppConnector {
  id = 'pages-app';
  title = 'payever Pages';

  protected app = PebIntegrationAppNamesEnum.Pages;

  getData(dataSourceId: string, params: any): Observable<any> {
    return this.context$.pipe(
      switchMap(({ theme, page, languageKey }) => {
        const data = {
          language: languageKey,
          parentId: page?.id,
          themeId: theme?.id,
        };

        return super.getData(dataSourceId, { ...params, data });
      }),
      take(1),
    );
  }
}
