import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Store } from '@ngxs/store';
import * as yaml from 'js-yaml';
import { EMPTY, forkJoin, Observable, of } from 'rxjs';
import { map, switchMap } from 'rxjs/operators';

import { PeAppEnv } from '@pe/app-env';
import { PeAuthService } from '@pe/auth';
import { PebWebsocketEventType, PebWebsocketMessage, PebWebsocketService } from '@pe/builder/api';
import { PebEnvService, pebGenerateId, PebPage } from '@pe/builder/core';


@Injectable({ providedIn: 'any' })
export class PebYamlService {

  get applicationPath() {
    return `${this.env.builder}/api/business/${this.env.business}/application/${this.env.id}`;
  }

  constructor(
    private readonly authService: PeAuthService,
    private readonly env: PeAppEnv,
    private readonly httpClient: HttpClient,
    private readonly pebEnvService: PebEnvService,
    private readonly websocketService: PebWebsocketService,
    private readonly store: Store,
  ) {
  }

  getTheme(fileList: FileList): Observable<any> {
    const files = new Map<string, File>();

    for (let i = 0; i < fileList.length; i++) {
      const file = fileList.item(i);
      if (file) {
        files.set(file.name.replace('.yml', ''), file);
      }
    }

    const themeFile = files.get('theme');
    if (themeFile) {
      const themeUrl = URL.createObjectURL(themeFile);

      return this.httpClient.get(themeUrl, { responseType: 'text' }).pipe(
        switchMap((themeYml: string) => {
          const themeJson = (yaml as any).safeLoad(themeYml);
          const pagesJson$ = themeJson.pages.reduce((arr: any, pageName: string) => {
            const pageFile = files.get(`page.${pageName}`);
            if (pageFile) {
              const pageUrl = URL.createObjectURL(pageFile);
              const pageJson$ = this.httpClient.get(pageUrl, { responseType: 'text' }).pipe(
                map((pageYml: string) => (yaml as any).safeLoad(pageYml))
              );
              arr.push(pageJson$);
            }

            return arr;
          }, []);

          if (pagesJson$.length) {
            return forkJoin(pagesJson$).pipe(
              map(pagesJson => ({ ...themeJson, pages: pagesJson }))
            );
          }

          delete themeJson.pages;

          return of(themeJson);
        }),
        // map((theme: any) => {
        //   if (theme.pages && theme.pages.length) {
        //     theme.pages = theme.pages.map((page: any, index: number, arr: any) => {
        //       const pageId = pebGenerateId();
        //
        //       const route = theme.routing.find((route: PebRoute) => route.pageId === page.id);
        //       if (route) {
        //         route.routeId = pebGenerateId();
        //         route.pageId = pageId;
        //       }
        //
        //       const prev = arr[index - 1];
        //       if (prev) {
        //         prev.next = pageId;
        //       }
        //
        //       page.id = pageId;
        //       page.prev = prev?.id ?? null;
        //       page.next = null;
        //
        //       if (page.elements.length) {
        //         page.elements = this.flatten(page.elements);
        //       }
        //
        //       return page;
        //     });
        //   }
        //
        //   return theme;
        // }),
      );
    }

    return EMPTY;
  }

  createTheme(theme: any, folderId?: string): Observable<any> {
    const targetFolderId = folderId
      ? { targetFolderId: folderId }
      : { };

    const body = {
      name: theme.name,
      content: {
        data: theme.data,
        routing: [],
        pages: [],
      },
      ...targetFolderId,
    };

    return this.httpClient.post<any>(`${this.applicationPath}/theme`, body).pipe(
      switchMap((response) => {
        const themeId = response.theme._id;
        const pages = theme.pages.map((page: any) => {
          const copy = { ...page };
          delete copy.elements;

          return copy;
        });

        const createPagesMessage = this.createPagesMessage(themeId, pages);
        this.websocketService.send(createPagesMessage);

        return this.websocketService.messages$.pipe(
          // filter(({ id }) => id === createPagesMessage.data.id),
          // switchMap(() => {
          //   theme.pages.forEach((page: any) => {
          //     this.websocketService.send(this.createElementsMessage(themeId, page.id, page.elements) as any);
          //   });
          //
          //   const themeDto = { ...theme, id: themeId };
          //   delete themeDto.pages;
          //
          //   this.store.dispatch([
          //     new PebSetThemeAction(themeDto),
          //     new PebSetPagesAction(pages),
          //   ]);
          //
          //   return this.websocketService.messages$.pipe(
          //     filter(msg => msg.name === PebWebsocketEventType.JsonPatch),
          //   );
          // }),
        );
      }),
    );
  }

  private flatten(elements: any): any {
    const flatten: any = [];

    const recursive = (element: any, index = 0, arr: any, parent?: any) => {
      element.id = pebGenerateId();

      if (parent) {
        element.parent = {
          id: parent.id,
          type: parent.type,
        };
      }

      const prev = arr[index - 1];
      if (prev) {
        prev.next = element.id;
      }

      element.prev = prev?.id ?? null;
      element.next = null;

      const children = element.children ? element.children.slice() : undefined;

      delete element.children;

      flatten.push(element);

      if (children) {
        children.forEach((child: any, i: number) => recursive(child, i, children, element));
      }
    };

    elements.forEach((element: any, index: number) => {
      recursive(element, index, elements);
    });

    return flatten;
  }

  private createPagesMessage(themeId: string, pages: PebPage[]): PebWebsocketMessage {
    const payload = { themeId, pages };

    return {
      event: PebWebsocketEventType.CreatePage,
      data: {
        id: pebGenerateId(),
        token: this.authService.token,
        params: payload as any,
      },
    };
  }

  private createElementsMessage(themeId: string, pageId: string, elements: any) {
    const payload = {
      themeId,
      pageId,
      patches: elements.map((element: any) => ({ op: 'add', path: [element.id], value: element })),
    };

    return {
      event: PebWebsocketEventType.JsonPatch,
      data: {
        id: pebGenerateId(),
        token: this.authService.token,
        params: payload as any,
      },
    };
  }
}
