import { Injectable } from '@angular/core';
import { Select, Store } from '@ngxs/store';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import { PebPage, PebPageSeoData } from '@pe/builder/core';
import { PebPagesState, PebUpdatePagesAction } from '@pe/builder/state';


@Injectable({ providedIn: 'any' })
export class PebSeoFormService {

  @Select(PebPagesState.pages) private readonly pages$!: Observable<PebPage[]>;
  @Select(PebPagesState.activePage) private readonly activePage$!: Observable<PebPage>;


  value$ = this.activePage$.pipe(
    map((page) => {
      return {
        title: page.seo?.title ?? page.name,
        url: page.seo?.url ?? page.url ?? '',
        description: page.seo?.description ?? '',
        showInSearchResults: page.seo?.showInSearchResults ?? false,
        canonicalUrl: page.seo?.canonicalUrl ?? '',
        markupData: page.seo?.markupData ?? '',
        customMetaTags: page.seo?.customMetaTags ?? '',
      };
    })
  );

  constructor(
    private readonly store: Store,
  ) {
  }

  update(value: any) {
    const page = this.store.selectSnapshot(PebPagesState.activePage);

    const seo =  {
      title: page.seo?.title ?? '',
      url: page.seo?.url ?? '',
      description: page.seo?.description ?? '',
      showInSearchResults: page.seo?.showInSearchResults ?? false,
      canonicalUrl: page.seo?.canonicalUrl ?? '',
      markupData: page.seo?.markupData ?? '',
      customMetaTags: page.seo?.customMetaTags ?? '',
    };

    const diff = Object.keys(seo).reduce((acc, key) => {
      if (seo[key] !== value[key]) {
        acc[key] = value[key];
      }

      return acc;
    }, {} as PebPageSeoData);

    this.store.dispatch(new PebUpdatePagesAction({ ...page, seo: { ...page.seo, ...diff } }));
  }
}
