import { Injectable } from '@angular/core';
import { Store } from '@ngxs/store';
import { Observable, of } from 'rxjs';

import {
  PebClientElm,
  PebElementDef,
  PebViewPage,
} from '@pe/builder/core';
import { PebViewPagesPatchAction } from '@pe/builder/view-actions';
import { PebViewState } from '@pe/builder/view-state';

import { collectFonts, pullElement, toDocument } from '../renderer/helpers';
import * as utils from '../utils';

import { PebClientApiService } from './api.service';
import { PebSsrStateService } from './ssr-state.service';


@Injectable()
export class PebClientPagesService {
  constructor(    
    private readonly store: Store,
    private readonly apiService: PebClientApiService,
    private readonly ssrStateService: PebSsrStateService,
  ) {
  }

  processElementDefs(pageId: string, pageElementDefs: PebElementDef[], masterElementDefs: PebElementDef[])
    : { rootElement: PebClientElm, fonts: any } {
    const theme = this.store.selectSnapshot(PebViewState.theme);
    const pages = this.store.selectSnapshot(PebViewState.pages);
    const languageKey = this.store.selectSnapshot(PebViewState.languageKey);
    if (!theme) {
      throw new Error('theme not found');
    }

    const languages: any[] = Object.values(theme.language.languages).filter((lang: any) => lang.active);
    const screens = Object.values(theme.screens);

    const pageRoot = toDocument(pageElementDefs, { languages, pages, screens, languageKey });
    const masterRoot = toDocument(masterElementDefs, { languages, pages, screens, languageKey } as any);
    const rootElement = pullElement(pageRoot, masterRoot);

    const fonts = collectFonts([...pageElementDefs, ...masterElementDefs], languages, screens);

    this.store.dispatch(new PebViewPagesPatchAction([{ id: pageId, rootElement, fonts }]));

    return { rootElement, fonts };
  }

  getPageElementDefs$(pageId: string | undefined): Observable<PebElementDef[]> {
    if (!pageId) {
      return of([]);
    }
    const appData = this.ssrStateService.getAppData();
    const page = appData?.pages?.find(page => page.id === pageId);
    const elements = page?.element ? Object.values(page.element) : [];

    if (elements.length) {
      return of(elements);
    }

    const themeId = appData?.theme?.id ?? '';
    const version = appData?.theme.versionNumber ?? 0;

    return this.apiService.getElements$(themeId, pageId, version);
  }

  findPageByUrl(url: string): PebViewPage | undefined {
    const pages = Object.values(this.store.selectSnapshot(PebViewState.pages));

    return utils.findPageByUrl(pages, url) ?? utils.find404(pages);
  }
}
