/* tslint:disable:no-string-literal */
import { Injectable } from '@angular/core';
import { TransferHttpService } from '@gorniv/ngx-universal';
import { Observable, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';

import { PebElement, PebPage, PebVersionShort } from '@pe/builder-core';
import { EnvironmentConfigService } from '@pe/ng-kit/modules/environment-config';
import { DomainInterface, DomainStatusEnum } from '../../../ssr/interfaces';

@Injectable({
  providedIn: 'root',
})
export class ApiService {

  constructor(
    private configService: EnvironmentConfigService,
    private transferHttpService: TransferHttpService,
  ) {}

  getDomain(name: string): Observable<DomainInterface> {
    const path = `${this.configService.getBackendConfig().builder}/api/domain/name/${name}`;

    return this.transferHttpService.get<DomainInterface>(path).pipe(
      catchError(error => {
        // 404 if domain not registered, loading default store
        // otherwise return null so nothing is loaded
        switch (error.status) {
          case 404:
            return of({ status: DomainStatusEnum.Unregistered });
          case 403:
            return of({ ...error.error.message, status: DomainStatusEnum.Passworded });
          default:
            return of({ status: DomainStatusEnum.Unknown });
        }
      }),
      map((domain: DomainInterface) => {
        if (domain && !domain.status) {
          domain.status = DomainStatusEnum.Loaded;
        }

        return domain ? domain : null;
      },
      ));
  }

  getPublishedVersion(applicationId: string): Observable<PebVersionShort> {
    const path = `${this.configService.getBackendConfig().builder}/api/versions/published-version/${applicationId}`;

    return this.transferHttpService.get<any>(path).pipe(
      map(v => {
        if (!v) {
          return null;
        }

        const { _id, __v, brief, ...versionProps } = v;

        return {
          id: _id,
          brief: brief ? brief.map(({ _id, ...br  }) => ({ ...br, id: _id })) : null, // tslint:disable-line:no-shadowed-variable
          ...versionProps,
        };
      }),
    );
  }

  getPage(applicationId: string, pageId: string): Observable<PebPage> {
    const path = `${this.configService.getBackendConfig().builder}/api/versions/published/${applicationId}/pages/${pageId}`;

    return this.transferHttpService.get<any>(path).pipe(
      map(page => {
        if (!page) {
          return null;
        }

        const { _id, __v, ...pageProps } = page;

        return {
          id: _id,
          ...pageProps,
        };
      }),
    );
  }
}

const updateElements = (element: PebElement) => {
  if (!element.type && element['component']) {
    element.type = element['component'];
  }

  if (element['_id'] && !element.id) {
    element.id = element['_id'];
  }

  // if (element.type === PebElementType.Text) {
  //   const width: any = element.style && element.style.width;
  //   if (width) {
  //     if (typeof width === 'number') {
  //       (element.style as any).width += 4;
  //     } else {
  //       Object.keys(element.style.width).forEach(k => element.style.width[k] += 4);
  //     }
  //   }
  // }

  return {
    ...element,
    children: element.children.map(updateElements),
  };
};
