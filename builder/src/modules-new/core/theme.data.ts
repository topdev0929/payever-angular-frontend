import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, of, zip } from 'rxjs';
import { filter, map, switchMap, tap } from 'rxjs/operators';

import { PebDocument } from '@pe/builder-core';
import { UpdateDocumentEvent } from '@pe/builder-editor/projects/modules/elements/src';
import { BuilderApi } from './api/builder-api.service';
import {
  AppTypeEnum,
  BaseThemeInterface,
  BaseThemeVersionInterface,
  RawThemeInterface,
  ThemeTypeEnum,
  ThemeVersionWithPagesInterface,
  ThemeWithPageInterface,
} from './core.entities';
import { CreateVersionDto } from './dto/version.dto';
import { createDefaultTheme } from './utils';

export interface ThemeDataContext {
  businessId?: string;
  applicationId?: string;
  applicationType?: AppTypeEnum;
  channelSet?: string;
}

/* tslint:disable:member-ordering */
@Injectable({ providedIn: 'root' })
export class ThemeData {
  private contextSubject$ = new BehaviorSubject<ThemeDataContext>(null);
  private requestInProgressSubject$ = new BehaviorSubject<boolean>(false);
  private themeSubject$ = new BehaviorSubject<ThemeWithPageInterface>(null);
  private versionsSubject$ = new BehaviorSubject<ThemeVersionWithPagesInterface>(null);

  pageRefreshRequired = false;

  constructor(private builderApi: BuilderApi) {
    (window as any).themeData = this;
  }

  get context$(): Observable<ThemeDataContext> {
    return this.contextSubject$.pipe(filter(v => !!v));
  }

  set context(value: ThemeDataContext) {
    this.contextSubject$.next(value);
  }

  get context(): ThemeDataContext {
    return this.contextSubject$.value;
  }

  get businessId(): string {
    return this.context.businessId;
  }
 
  get channelSet(): string {
    return this.context.channelSet;
  }

  get applicationId(): string {
    return this.context.applicationId;
  }

  get applicationType(): AppTypeEnum {
    return this.context.applicationType;
  }

  get requestInProgress$(): Observable<boolean> {
    return this.requestInProgressSubject$.asObservable();
  }

  get theme$(): Observable<ThemeWithPageInterface> {
    return this.themeSubject$.pipe(filter(v => !!v));
  }

  get theme(): ThemeWithPageInterface {
    return this.themeSubject$.value;
  }

  get versions$(): Observable<ThemeVersionWithPagesInterface> {
    return this.versionsSubject$.pipe(filter(v => !!v));
  }

  getNewTheme(): Observable<BaseThemeInterface> {
    const newTheme = {
      ...createDefaultTheme(),
      appType: 'shop' as AppTypeEnum,
      active: true,
      business: this.businessId,
      logo: null,
      type: ThemeTypeEnum.app,
      currentVersion: null,
      versions: [],
    };

    return this.saveCurrentTheme(newTheme).pipe(
      tap(theme => this.themeSubject$.next({ ...newTheme, id: theme.id })),
    );
  }

  getActiveTheme(): Observable<ThemeWithPageInterface> {
    return this.builderApi
      .getAppThemes({
        businessId: this.context.businessId,
        applicationId: this.context.applicationId,
        active: true,
      })
      .pipe(
        switchMap(response => {
          if (response.length > 1) {
            console.warn('DATA INCONSISTENCY: There should be only one active theme');
          }

          if (!response.length) {
            return of(createDefaultTheme());
          }

          return this.builderApi.getPages(response[0].pages).pipe(
            map(pages => ({
              ...response[0],
              pages,
            })),
          );
        }),
        tap(theme =>
          this.themeSubject$.next({
            ...theme,
            currentVersion: theme.currentVersion ? theme.currentVersion.id : null,
          }),
        ),
        switchMap(() => this.theme$),
      );
  }

  getSpecificTheme(themeId: string): Observable<ThemeWithPageInterface> {
    return this.builderApi
      .getAppThemes({
        applicationId: this.context.applicationId,
        businessId: this.context.businessId,
      })
      .pipe(
        switchMap(themes => {
          const theme = themes.find(({ id }) => id === themeId);

          return this.builderApi.getPages(theme.pages).pipe(
            map(pages => ({
              ...theme,
              pages,
            })),
          );
        }),
        tap(theme => {
          this.themeSubject$.next(theme);

          return theme;
        }),
        switchMap(() => this.theme$),
      );
  }

  // saveTheme(currentTheme) {
  //   const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

  //   return of(currentTheme).pipe(
  //     tap(() => this.requestInProgressSubject$.next(true)),
  //     switchMap(theme => !Boolean(theme.id)
  //       ? of(theme).pipe(
  //         switchMap(() =>
  //           zip(...theme.pages.map(this.builderApi.postPage)),
  //         ),
  //         switchMap((pages: PebDocument[]) =>
  //           this.builderApi.postTheme(
  //             this.businessId,
  //             this.applicationId,
  //             {
  //               id: null,
  //               business: this.businessId,
  //               type: ThemeTypeEnum.app,
  //               appType: this.applicationType,
  //               name: theme.name,
  //               logo: null,
  //               active: true,
  //               currentVersion: null,
  //               versions: [],
  //               pages: pages.map(p => p.id),
  //             },
  //             true
  //           ),
  //         ),
  //       )
  //       : of(theme).pipe(
  //         switchMap(() =>
  //           zip(...theme.pages.map(this.builderApi.patchPage)),
  //         ),
  //         switchMap((pages: PebDocument[]) => {
  //           // @TODO: This was temporary added to make sure that themes a saved properly
  //           const themePages = pages.map(p => p.id);
  //           let hasError = false;

  //           themePages.forEach(page => {
  //             if (!uuidRegex.test(page)) {
  //               hasError = true;
  //               alert('Attempt to send invalid data into database');
  //             }
  //           });

  //           if (hasError) {
  //             throw new Error('Invalid theme input');
  //           }

  //           return this.builderApi.patchTheme({
  //             ...theme,
  //             pages: pages.map(p => p.id),
  //             currentVersion: null,
  //           });
  //         }),
  //         tap(resultingTheme => {
  //           resultingTheme.pages.forEach(page => {
  //             if (!uuidRegex.test(page)) {
  //               alert('Backend responded with invalid theme');
  //             }
  //           });
  //         }),
  //         switchMap(t => this.builderApi.getPages(t.pages).pipe(
  //           map(pages => ({
  //             ...theme,
  //             pages,
  //           }))
  //         )),
  //       ),
  //     ),
  //     tap((result: any) => {
  //       this.requestInProgressSubject$.next(false);
  //       this.themeSubject$.next(({
  //         ...result,
  //         currentVersion: currentTheme.currentVersion,
  //       }));
  //     })
  //   );
  // }

  getThemeVersions(): Observable<BaseThemeVersionInterface[]> {
    return of(this.theme).pipe(switchMap(theme => this.builderApi.getThemeVersions(theme.id)));
  }

  createThemeVersion(name: string, currentTheme: ThemeWithPageInterface): Observable<ThemeVersionWithPagesInterface> {
    const versionDto: CreateVersionDto = {
      applicationTheme: currentTheme.id,
      current: true,
      name,
      pages: currentTheme.pages,
    };

    return this.builderApi.postThemeVersion(versionDto);
  }

  useVersion(version: ThemeVersionWithPagesInterface): void {
    this.pageRefreshRequired = true;
    this.themeSubject$.next({
      ...this.themeSubject$.value,
      currentVersion: version.id,
      pages: version.pages,
    });
  }

  // publishVersion(version) {
  //   return this.builderApi.patchThemeVersion({
  //     id: version.id,
  //     published: true,
  //   });
  // }

  // deleteVersion(version) {
  //   return this.builderApi.deleteThemeVersion(version);
  // }

  updateContext(value: ThemeDataContext): void {
    const updatedContext: ThemeDataContext = { ...this.context, ...value };
    this.context = updatedContext;
  }

  autoSaveAction(
    { document, action: { type, payload } }: UpdateDocumentEvent,
  ): void {
    // if (type === RemoveElementsAction) {
    //   return zip(...(payload as RemoveElementsPayload).map(
    //     elementId => this.builderApi.deleteElement(document.id, elementId)
    //   ));
    // }
    // let parentId: string;
    // let element: PebElement;
    // switch (type) {
    //   case AppendElementAction:
    //     parentId = (payload as AppendElementPayload).parentId;
    //     element = (payload as AppendElementPayload).PebElement;
    //     break;
    //   case InsertSibilingToAction:
    //     parentId = (payload as InsertSibilingToPayload).parentId;
    //     element = (payload as InsertSibilingToPayload).PebElement;
    //     break;
    //   case UpdateElementAction:
    //   case MoveElementAction:
    //     const elementId = (payload as UpdateElementPayload | MoveElementPayload).elementId;
    //     const parents = findElementParents(document, elementId);
    //     parentId = parents && parents.length ? parents[parents.length - 1].id : null;
    //     element = findElement(document, elementId);
    //     break;
    // }
    // if (element.component === PebElementType.Section && type === InsertSibilingToAction) {
    //   return this.builderApi.patchPage(document);
    // }
    // return element.component === PebElementType.Document ?
    //   this.savePage(element) : this.builderApi.patchElement(document.id, parentId, element);
  }

  // savePage(page: PebDocument): Observable<any> {
  //   return this.builderApi.postPage(page);
  // }

  saveCurrentTheme(theme: ThemeWithPageInterface): Observable<BaseThemeInterface> {
    this.requestInProgressSubject$.next(true);

    const pageIds: string[] = theme.pages.map(page => page.id);
    const payload: RawThemeInterface = {
      ...theme,
      pages: pageIds,
    };

    const themeRequest$: Observable<BaseThemeInterface> = theme.id
      ? this.builderApi.patchTheme(theme.id, payload)
      : this.builderApi
          .postTheme(
            this.businessId,
            this.applicationId,
            {
              id: null,
              business: this.businessId,
              type: ThemeTypeEnum.app,
              appType: this.applicationType,
              name: theme.name,
              logo: null,
              active: true,
              currentVersion: null,
              versions: [],
              pages: pageIds,
            },
            true,
          )
          .pipe(tap((themeResponse: ThemeWithPageInterface) => this.themeSubject$.next(themeResponse)));

    return themeRequest$.pipe(tap(() => this.requestInProgressSubject$.next(false)));
  }
}
