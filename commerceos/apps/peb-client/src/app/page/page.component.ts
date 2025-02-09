import { DOCUMENT, isPlatformBrowser, isPlatformServer } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  HostBinding,
  Inject,
  PLATFORM_ID,
  Renderer2,
} from '@angular/core';
import { Meta, Title } from '@angular/platform-browser';
import { ActivatedRoute } from '@angular/router';
import { Select, Store } from '@ngxs/store';
import produce from 'immer';
import { animationFrameScheduler, combineLatest, EMPTY, fromEvent, merge, Observable, of, ReplaySubject } from 'rxjs';
import {
  catchError,
  distinctUntilChanged,
  filter,
  map,
  retry,
  startWith,
  switchMap,
  takeUntil,
  tap,
  throttleTime,
  withLatestFrom,
} from 'rxjs/operators';

import { pebColorToCss } from '@pe/builder/color-utils';
import {
  PebPage,
  PebScreen,
  PebTheme,
  PebDefaultTextStyles,
  PebDefaultScreens,
  PEB_ROOT_SCREEN_KEY,
  PebLanguage,
  PebConnectorContext,
  PebRenderElementModel,
  PebViewPage,
  PebViewQueryModel,
  PebElementType,
} from '@pe/builder/core';
import { PebConnectorProxyService } from '@pe/builder/integrations';
import {
  addSeoMetadata,
  flattenContexts,
  flattenELements,
  getPageLanguage,
  getScreenBySize,
  PEB_LANGUAGE_QUERY_PARAM,
  PebSeoModel,
  toPebMap,
} from '@pe/builder/render-utils';
import {
  PebRenderSetRootElementAction,
  PebViewContextRenderAllAction,
  PebViewContextSetAction,
  PebViewLanguageSetAction,
  PebViewPageRenderingAction,
  PebViewQueryPatchAction,
  PebViewScreenSetAction,
  PebViewScriptsRenderAction,
  PebViewScriptsSetAction,
} from '@pe/builder/view-actions';
import { PebViewContextRenderService } from '@pe/builder/view-handlers';
import { PebViewState } from '@pe/builder/view-state';
import { PeDestroyService } from '@pe/common';

import { CLIENT_CONTAINER, SSR_CONTAINER } from '../../constants';
import { toRenderElement } from '../renderer/helpers';
import { PebClientApiService, PebSsrStateService } from '../services';
import { PebClientConfigService } from '../services/config.service';

import { PebClientPageNotFoundComponent } from './page-not-found.component';

const RENDER_RETRY = 5;

@Component({
  selector: 'peb-client-page',
  template: `
    <ng-container *ngIf="elements$|async as elements;">
      <peb-client-renderer
        [elements]="(elements$ | async)?? {}"
      ></peb-client-renderer>
    </ng-container>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [PeDestroyService],
})
export class PebClientPageComponent {
  @Select(PebViewState.theme) theme$!: Observable<PebTheme>;
  @Select(PebViewState.elements) elements$!: Observable<{ [id: string]: PebRenderElementModel }>;
  @Select(PebViewState.page) page$!: Observable<PebViewPage>;
  @Select(PebViewState.language) language$!: Observable<PebLanguage>;
  @Select(PebViewState.languages) languages$!: Observable<{ [key: string]: PebLanguage }>;
  @Select(PebViewState.languageKey) languageKey$!: Observable<string>;
  @Select(PebViewState.screen) screen$!: Observable<PebScreen>;
  @Select(PebViewState.screens) screens$!: Observable<PebScreen[]>;
  @Select(PebViewState.query) query$!: Observable<PebViewQueryModel>;

  renderError$ = new ReplaySubject<Error>(1);
  errorComponent$ = this.renderError$.pipe(
    tap(err => err && this.handleRenderError(err)),
    map(err => this.getErrorComponent(err)),
  );

  renderPage$ = this.page$.pipe(
    distinctUntilChanged((a, b) => a?.id === b?.id),
    withLatestFrom(this.theme$, this.screen$),
    switchMap(([page, theme, screen]) => {
      if (!page) {
        this.renderError$.next(new Error('page not found:' + this.route.snapshot.url));

        return of(undefined);
      }

      if (!page.rootElement) {
        this.renderError$.next(new Error('root element not found'));

        return of(undefined);
      }

      const languageKey = this.store.selectSnapshot(PebViewState.languageKey);
      const element = toRenderElement(page.rootElement, screen.key, page.id, this.container, languageKey);
      this.renderPage(element, page, theme);

      return this.renderContext$(element);
    }),
    retry(RENDER_RETRY),
    switchMap(() => this.renderScripts$()),
    catchError((err, caught) => {
      this.renderError$.next(new Error(err));

      return of(undefined);
    }),
  );

  windowResize$ = isPlatformBrowser(this.platformId) ? fromEvent(window, 'resize').pipe(
    throttleTime(0, animationFrameScheduler, { trailing: true }),
    map(ev => (ev.target as Window).innerWidth),
    startWith(window.innerWidth),
    withLatestFrom(this.screens$),
    map(([width, screens]) => getScreenBySize(screens, width)),
    filter(screen => !!screen),
    distinctUntilChanged(),
    tap(screen => this.store.dispatch(new PebViewScreenSetAction(screen.key))),
  ) : of(EMPTY);

  queryParameters$ = this.route.queryParamMap.pipe(
    tap((map: any) => this.store.dispatch(new PebViewQueryPatchAction({ urlParameters: map?.params }))),
    switchMap((map) => {
      let languageKey = map.get(PEB_LANGUAGE_QUERY_PARAM);
      if (languageKey) {
        this.store.dispatch(new PebViewQueryPatchAction({ languageKey }));
        this.store.dispatch(new PebViewLanguageSetAction(languageKey));
      }

      return of(languageKey);
    }),
  );

  setLanguage$ = this.theme$.pipe(
    withLatestFrom(this.page$, this.query$),
    tap(([theme, page, query]) => this.setLanguage(theme, page, query)),
  )

  clientConnectorContext$: Observable<PebConnectorContext> = combineLatest([
    this.languageKey$,
    this.languages$,
    this.page$,
    this.screen$,
    this.theme$,
  ]).pipe(
    map(([languageKey, languages, page, screen, theme]) => ({
      languageKey: languageKey ?? '',
      languages: Object.values(languages ?? {}),
      page: page ?? {} as PebPage,
      screen: screen ?? PebDefaultScreens[PEB_ROOT_SCREEN_KEY],
      theme: theme ?? {} as PebTheme,
    })),
  );

  container = isPlatformBrowser(this.platformId) ? CLIENT_CONTAINER : SSR_CONTAINER;

  constructor(
    private route: ActivatedRoute,
    private readonly store: Store,
    private readonly destroy$: PeDestroyService,
    @Inject(PLATFORM_ID) private platformId: any,
    @Inject(DOCUMENT) private document: Document,
    private readonly renderer: Renderer2,
    private meta: Meta,
    private title: Title,
    private contextRenderService: PebViewContextRenderService,
    private configService: PebClientConfigService,
    private connectorProxy: PebConnectorProxyService,
    private ssrStateService: PebSsrStateService,
    private clientApiService: PebClientApiService,
  ) {
    this.connectorProxy.setContext(this.clientConnectorContext$);

    merge(
      this.windowResize$,
      this.queryParameters$,
      this.renderPage$,
      this.errorComponent$,
      this.setLanguage$,
    ).pipe(
      takeUntil(this.destroy$),
    ).subscribe();
  }

  @HostBinding('style')
  get defaultFont() {
    const { fontFamily, fontWeight, italic, color, letterSpacing, lineHeight } = PebDefaultTextStyles;

    return { fontFamily, fontWeight, italic, color: pebColorToCss(color), letterSpacing, lineHeight };
  }

  renderPage(
    rootElement: PebRenderElementModel,
    page: PebViewPage,
    theme: PebTheme,
  ) {
    this.addFonts(page.fonts);
    this.title.setTitle(page.seo?.title ?? page.name);
    this.addSeoMetadata(page.seo);
    this.addFavicon(theme.favicon);

    const query = this.store.selectSnapshot(PebViewState.query);
    if (isPlatformServer(this.platformId) && !query.isSearchEngine) {
      rootElement = produce(rootElement, (draft) => {
        draft.children = draft.children.filter(elm => elm.type === PebElementType.Section);
      });
    }

    this.store.dispatch(new PebViewPageRenderingAction(flattenELements(rootElement)));
    this.store.dispatch(new PebRenderSetRootElementAction(rootElement.id));

    this.renderError$.next(undefined);
  }

  renderContext$(rootElement: PebRenderElementModel): Observable<any> {
    const rootContext$ = this.contextRenderService.createRootContext$();

    return rootContext$.pipe(
      switchMap(() => this.contextRenderService.resolveContext$(rootElement).pipe(
        tap((context) => {
          this.store.dispatch(new PebViewContextSetAction(flattenContexts(context)));
          this.store.dispatch(new PebViewContextRenderAllAction());
          this.ssrStateService.transferRenderDataToSsrState();
        }),
      )),
    );
  }

  renderScripts$(): Observable<any> {
    if (isPlatformServer(this.platformId)) {
      return of(undefined);
    }

    const page = this.store.selectSnapshot(PebViewState.page);
    const theme = this.store.selectSnapshot(PebViewState.theme);
    if (!page || !theme) {
      return of(undefined);
    }

    return this.clientApiService.getScripts$(theme.id, theme.versionNumber).pipe(
      tap((scripts) => {
        this.store.dispatch(new PebViewScriptsSetAction(toPebMap(scripts)));
        this.store.dispatch(new PebViewScriptsRenderAction());
      }),
    );
  }

  handleRenderError(err: Error) {
    console.error(err);
    this.addFonts({ Roboto: { normal: [400, 700], italic: [] } });
    err && this.title.setTitle(err.message);
    this.store.dispatch(new PebRenderSetRootElementAction(undefined));
    this.ssrStateService.patchAppData({ hasRenderError: true });
  }

  getErrorComponent(err: Error) {
    if (!err) {
      return undefined;
    }

    return { component: PebClientPageNotFoundComponent };
  }

  addSeoMetadata(seo: PebSeoModel) {
    const { metaTags, elements } = addSeoMetadata(this.renderer, seo);
    this.meta.addTags(metaTags);
    elements.map(element => this.renderer.appendChild(this.document.head, element));
  }

  addFavicon(favicon?: string) {
    if (favicon) {
      this.setFavicon(favicon);
    }
    else {
      this.setFavicon(`assets/${this.configService.config.appType}-favicon.ico`);
    }
  }

  private setFavicon(url: string): void {
    const doc = this.document.getElementById('appFavicon');
    doc && doc.setAttribute('href', url);
  };

  private setLanguage(theme: PebTheme, page: PebViewPage, query: PebViewQueryModel) {
    const languageKey = getPageLanguage(
      theme?.language?.defaultLanguage?.key,
      page?.defaultLanguage,
      query.languageKey,
    );

    this.store.dispatch(new PebViewLanguageSetAction(languageKey));
  }

  addFonts(value: { [key: string]: { normal: number[], italic: number[] } }) {
    const fonts = [];
    for (const [name, props] of Object.entries(value)) {
      const normalAxis = [...props.normal].sort().map((w) => {
        return props.italic.length ? `0,${w}` : `${w}`;
      });
      const italicAxis = [...props.italic].sort().map((w) => {
        return props.normal.length ? `1,${w}` : `${w}`;
      });

      const wght = normalAxis.concat(italicAxis).join(';');

      const strItalic = italicAxis.length ? 'ital,' : ``;
      const strWght = wght.length ? `:${strItalic}wght@${wght}` : ``;
      const str = `family=${name}${strWght}`;
      fonts.push(str);
    }

    const head = this.document.head;

    const preload = this.renderer.createElement('link');
    preload.setAttribute('rel', 'preload');
    preload.setAttribute('as', 'style');
    preload.setAttribute('href', `https://fonts.googleapis.com/css2?${fonts.join('&')}&display=block`);
    this.renderer.appendChild(head, preload);

    const link = this.renderer.createElement('link');
    link.setAttribute('rel', 'stylesheet');
    link.setAttribute('href', `https://fonts.googleapis.com/css2?${fonts.join('&')}&display=block`);
    this.renderer.appendChild(head, link);
  }
}
