import { Injectable } from '@angular/core';
import { Select } from '@ngxs/store';
import { Observable, combineLatest, of } from 'rxjs';
import { catchError, map, shareReplay, switchMap } from 'rxjs/operators';

import { PebEditorApi } from '@pe/builder/api';
import { PebElementDef, PebInteractionType, PebPage } from '@pe/builder/core';
import { PebElementsState, PebPagesState } from '@pe/builder/state';
import { AppType } from '@pe/common';

import { getLinks } from './link-form';

const pluralAppType: { [appType: string]: string } = {
  [AppType.Pos]: 'POS',
};


@Injectable()
export class PebLinkService {

  @Select(PebPagesState.pages) private readonly pages$!: Observable<PebPage[]>;
  @Select(PebElementsState.elementsByName) private readonly elements$!: Observable<Map<string, PebElementDef>>;

  links$ = combineLatest([this.pages$, this.elements$]).pipe(
    map(([pages, elements]) => getLinks(pages, elements)),
    switchMap(links => this.editorApi.getBusinessApps().pipe(
      map(applications => Object.entries(applications).reduce((acc, [appType, apps]) => {
        if (apps?.length) {
          const label = appType.charAt(0).toUpperCase() + appType.substr(1);
          const labelText = pluralAppType[appType] || `${label}s`;
          acc.push({
            name: label,
            value: `${PebInteractionType.NavigateApplicationLink}:${appType}`,
            payload: [
              {
                label: `All ${labelText}`,
                type: 'select',
                options: apps.map(app => ({
                  name: app.name,
                  value: app.id,
                })),
                controlName: 'application',
              },
              {
                label: '',
                type: 'hidden',
                controlName: 'url',
                changeType: 'keyup',
                placeholder: '/url',
                valuePrefix: '/',
              },
            ],
          });
        }

        return acc;
      }, links)),
      catchError(() => of(links)),
    )),
    shareReplay(1),
  );

  constructor(
    private editorApi: PebEditorApi,
  ) {
  }
}
