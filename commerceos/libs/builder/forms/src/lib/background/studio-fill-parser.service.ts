import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';

import { PebFill, PebFillType, PebIframeFill, PebJsFill, isJs } from '@pe/builder/core';
import { extractIframeSrc } from '@pe/builder/render-utils';


@Injectable({ providedIn: 'any' })
export class PebStudioFillParserService {

  constructor(
    private readonly http: HttpClient,
  ) {
  }

  parseFill$(fill: PebFill): Observable<PebFill> {
    if (isJs(fill)) {
      return this.fetchContent$(fill.url).pipe(
        map(content => this.parseAsIframe(fill, content) ?? fill),
        catchError((err: any) => {
          console.error('Error retrieve data', err);

          return of(fill);
        })
      );
    }

    return of(fill);
  }

  parseAsIframe(scriptFill: PebJsFill, content: string): PebIframeFill | undefined {
    const src = extractIframeSrc(content);
    if (!src) {
      return undefined;
    }

    return {
      type: PebFillType.Iframe,
      origin: scriptFill.origin,
      src,
      title: `iframe ${scriptFill.title}`,
    };
  }

  fetchContent$(url: string): Observable<string> {
    return this.http.get<string>(url, { responseType: 'text' as 'json' });
  }
}