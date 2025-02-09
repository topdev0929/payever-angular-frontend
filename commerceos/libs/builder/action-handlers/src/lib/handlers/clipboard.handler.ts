import { Clipboard } from '@angular/cdk/clipboard';
import { Inject, Injectable, OnDestroy } from '@angular/core';
import { Actions, Select, Store, ofActionDispatched } from '@ngxs/store';
import { Observable, Subject, forkJoin, from, merge, of } from 'rxjs';
import { catchError, finalize, switchMap, takeUntil, tap, throttleTime, withLatestFrom } from 'rxjs/operators';

import { PeAppEnv } from '@pe/app-env';
import { PEB_ROOT_SCREEN_KEY, PebClipboardData, PebEditorPoint, PebElementDef, PebFigmaPluginClipboard, PebFillType, PebMediaService, PebPasteTypes } from '@pe/builder/core';
import { detectPasteType, getClipboardData, getClipboardElements, parseSvgToElementDef } from '@pe/builder/editor-utils';
import { PebElement } from '@pe/builder/render-utils';
import {
  PebClipboardState,
  PebCopyElementsAction,
  PebEditorState,
  PebElementsState,
  PebInsertAction,
  PebPasteElementsAction,
  PebSetClipboardElements,
} from '@pe/builder/state';
import { EnvironmentConfigInterface, PE_ENV } from '@pe/common';
import { SnackbarService } from '@pe/snackbar';

const PEB_PASTE_THROTTLE_TIME = 500;

@Injectable()
export class PebClipboardActionHandler implements OnDestroy {

  @Select(PebElementsState.selected) selected$!: Observable<PebElement[]>;
  @Select(PebEditorState.elements) elements$!: Observable<{ [id: string]: PebElementDef }>;
  @Select(PebClipboardState.elements) copiedElements$!: Observable<PebElementDef[]>;

  resolver: { [type in PebPasteTypes]: (text: string, position?: PebEditorPoint) => void | Promise<void> } = {
    [PebPasteTypes.ElementDef]: (text, position) => this.pasteAsElementDef(text, position),
    [PebPasteTypes.SVG]: text => this.pasteAsSvg(text),
    [PebPasteTypes.FigmaPlugin]: async text => await this.pasteAsFigmaPluginData(text),
  };

  private copy$ = this.actions$.pipe(
    ofActionDispatched(PebCopyElementsAction),
    withLatestFrom(this.selected$, this.elements$),
    tap(([action, selected, elements]) => this.copyElements(selected, elements)),
  )

  private paste$ = this.actions$.pipe(
    ofActionDispatched(PebPasteElementsAction),
    throttleTime(PEB_PASTE_THROTTLE_TIME),
    switchMap(({ position }) => from(navigator.clipboard.readText()).pipe(
      tap((text) => {
        const resolver = this.resolver[detectPasteType(text)];
        resolver && resolver(text, position);
      }),
    )
  ));

  private destroy$ = new Subject<void>();

  constructor(
    private readonly clipboard: Clipboard,
    private readonly store: Store,
    private readonly actions$: Actions,
    private readonly mediaService: PebMediaService,
    @Inject(PE_ENV) private env: EnvironmentConfigInterface,
    private appEnv: PeAppEnv,
    private snackbarService: SnackbarService,
  ) {
    merge(this.copy$, this.paste$).pipe(
      takeUntil(this.destroy$),
      catchError((err, caught) => {
        console.error(err);

        return caught;
      })
    ).subscribe();
  }

  ngOnDestroy() {
    this.destroy$.next();
  }

  private copyElements(selected: PebElement[], elements: { [id: string]: PebElementDef }) {
    const ids: string[] = [];

    const queue = [...selected];
    while (queue.length) {
      const child = queue.pop();

      if (child) {
        ids.push(child.id);
        queue.push(...child.children ?? []);
      }
    }

    const screens = this.store.selectSnapshot(PebEditorState.screens);
    const data = getClipboardData(ids, screens, selected, elements);

    this.clipboard.copy(JSON.stringify(data));
    this.store.dispatch(new PebSetClipboardElements(data.elements));
  }

  private pasteAsElementDef(text: string, position?: PebEditorPoint) {
    const data: PebClipboardData = JSON.parse(text);

    if (data) {
      const screens = this.store.selectSnapshot(PebEditorState.screens);
      const elements = getClipboardElements(data, screens, position);
      this.store.dispatch(new PebInsertAction(elements, { selectInserted: true, sync: true }));
    }
  }

  private async pasteAsSvg(text: string): Promise<void> {
    const elements = parseSvgToElementDef(text);
    this.store.dispatch(new PebInsertAction(elements, { selectInserted: true, sync: true }));
  }
  
  private async pasteAsFigmaPluginData(text: string): Promise<void> {
    const config = {
      content: 'Pasting elements',
      pending: true,
    };
    this.snackbarService.toggle(true, config);
    const figmaPluginClipboardData: PebFigmaPluginClipboard = JSON.parse(text);
    const imageElements: PebElementDef[] = figmaPluginClipboardData.elements.filter(a => a.styles[PEB_ROOT_SCREEN_KEY]?.fill?.type === PebFillType.Image);

    const uploadConfig = {
      imageProcessing: {
        fileType: "image/png",
        blobNamePrefix: "figma_plugin_",
        storageContainerFormat: `${this.appEnv.type}-images`,
      },
    };

    const uploadObservables = imageElements.map((imageElement) => {
      const style = imageElement.styles[PEB_ROOT_SCREEN_KEY];
      if (style.fill.type !== PebFillType.Image) {
        return of(null);
      }
      const imageHash = style.fill.url;
      const base64Data = figmaPluginClipboardData.hashContentMap[imageHash];
      const imageBlob = this.base64toBlob(base64Data);
      const blobName = `${uploadConfig.imageProcessing.blobNamePrefix}${imageHash}`;
      const imageFile = new File([imageBlob], blobName + uploadConfig.imageProcessing.fileType, { type: uploadConfig.imageProcessing.fileType });
      const container = uploadConfig.imageProcessing.storageContainerFormat;
      const url = `${this.env?.custom?.cdn}/${container}/${blobName}`;
      style.fill.url = url;
  
      return this.mediaService.uploadImage(imageFile, `cdn/${container}`, blobName).pipe(
        catchError(error => of(error)),
      );
    });
  
    forkJoin(uploadObservables)
      .pipe(finalize(() => this.snackbarService.hide()))
      .subscribe();
  
    this.store.dispatch(new PebInsertAction(figmaPluginClipboardData?.elements, { selectInserted: true, sync: true }));
  }


  private base64toBlob(base64Data: string) {
    const binaryString = window.atob(base64Data);
    const len = binaryString.length;
    const bytes = new Uint8Array(len);

    for (let i = 0; i < len; ++i) {
      bytes[i] = binaryString.charCodeAt(i);
    }

    return new Blob([bytes]);
  }
}
