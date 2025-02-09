import { Injectable } from '@angular/core';
import { Actions, Select, Store } from '@ngxs/store';
import { combineLatest, Observable } from 'rxjs';
import { filter, map, startWith } from 'rxjs/operators';

import { isMasterPage, PebLanguage, PebPage, PebPageVariant, PebThemeLanguageSetting } from '@pe/builder/core';
import { PebEditorState, PebPagesState, PebSetLanguageAction, PebUpdatePagesAction } from '@pe/builder/state';
import { SnackbarService } from '@pe/snackbar';


@Injectable({ providedIn: 'any' })
export class PebPageFormService {

  @Select(PebPagesState.activePage) readonly page$!: Observable<PebPage>;
  @Select(PebEditorState.languageSetting) readonly languageSetting$!: Observable<PebThemeLanguageSetting>;
  @Select(PebEditorState.pages) readonly pages$!: Observable<{ [id: string]: PebPage }>;

  activePage$: Observable<PebPageFormValue> = this.page$.pipe(
    filter(Boolean),
    map((page: PebPage) => {
      const frontPage = page.variant === PebPageVariant.Front;

      return {
        frontPage,
        name: page.name,
        variant: page.variant,
        url: frontPage ? '/' : page.url ?? '',
        isMaster: page.master?.isMaster ?? false,
        masterPage: page.master?.page,
        parentId: page.parentId,
        defaultLanguage: page.defaultLanguage ?? '',
      };
    }),
  )

  masterPages$ = this.pages$.pipe(
    startWith([]),
    filter(Boolean),
    map((data) => {
      const values = Object.values(data).filter(isMasterPage).map(page => ({ name: page.name, value: page.id }));

      return [{ value: undefined, name: '-Blank-' }, ...values];
    }),
  );

  parents$ = combineLatest([this.page$, this.pages$]).pipe(
    filter(([page]) => !isMasterPage(page)),
    map(([activePage, pages]) => activePage && Object.values(pages)
      .filter(page => page.id !== activePage.id && !this.getParentIds(pages, page).includes(activePage.id)),
    ),
    filter(pages => !!pages),
    map(pages => [
      { name: 'None', value: undefined },
      ...pages.map(page => ({ value: page.id, name: page.name }))]),
  );

  languages$ = this.languageSetting$.pipe(
    map((languageSetting) => {
      return Object.values(languageSetting?.languages ?? {});
    }),
    map((languages: PebLanguage[]) => [
      { name: 'None', value: '' },
      ...languages.map(lan => ({ name: lan.title, value: lan.key })),
    ]),
  );

  constructor(
    private readonly store: Store,
    private readonly snackbarService: SnackbarService,  
    private actions$: Actions,
  ) {
  }

  private getParentIds(pages: { [key: string]: PebPage }, page: PebPage): string[] {
    const result = [];
    let parentId = page.parentId;
    while (parentId) {
      result.push(parentId);
      parentId = pages[parentId]?.parentId;
    }

    return result;
  }

  /** if set as new front page, change only variant to front but do not change url or seo.url */
  updatePage(value: PebPageFormValue): void {
    const page = this.store.selectSnapshot(PebPagesState.activePage);

    if (value.frontPage && page.variant !== PebPageVariant.Front) {
      const pages = this.store.selectSnapshot(PebPagesState.pages);
      const homePage = pages.find(p => p.variant === PebPageVariant.Front);
      const payload = [
        { ...page, variant: PebPageVariant.Front },
        { ...homePage, variant: PebPageVariant.Default },
      ];
      this.store.dispatch(new PebUpdatePagesAction(payload));
    } else if (!value.frontPage && page.variant === PebPageVariant.Front) {
      this.store.dispatch(new PebUpdatePagesAction({ ...page, variant: PebPageVariant.Default }));
      this.showSnackbar('In order to publish, new Home Page must be set');
    } else {
      const payload: PebPage = { ...page, name: value.name };
      if (!value.frontPage) {
          payload.url = value.url;
          payload.variant = value.variant;
      }
      payload.master = { ...page.master, page: value.masterPage };
      payload.parentId = value.parentId;
      payload.defaultLanguage = value.defaultLanguage;

      this.store.dispatch(new PebUpdatePagesAction(payload));

      if (value.defaultLanguage) {
        const language = this.store.selectSnapshot(PebEditorState.languages)[value.defaultLanguage];
        this.store.dispatch(new PebSetLanguageAction(language));
      }
    }
  }

  showSnackbar(content: string) {
    const duration = 2000;
    const iconId = 'icon-alert-24';

    this.snackbarService.toggle(true, { content, duration, iconId });
  }
}

export interface PebPageFormValue {
  frontPage: boolean;
  name: string;
  variant: PebPageVariant;
  url: string;
  isMaster: boolean;
  masterPage: string;
  parentId: string;
  defaultLanguage: string;
}
