import { Injectable, OnDestroy } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Actions, Select, Store, ofActionDispatched } from '@ngxs/store';
import { Observable, Subject, merge, of } from 'rxjs';
import { catchError, distinctUntilChanged, filter, map, switchMap, takeUntil, tap, withLatestFrom } from 'rxjs/operators';

import { PebRenderPebElementsAction, PebSetRenderPatchModeAction } from '@pe/builder/actions';
import { PebControlsService } from '@pe/builder/controls';
import { PebEditorPatchMode, PebElementDef, PebLanguage, PebPage, PebScreen } from '@pe/builder/core';
import { applyDocumentBBoxUpdate, clonePebElement, elementModels, flattenElements, onlyVisibleElements, toElementWithIntegrationTree } from '@pe/builder/editor-utils';
import { PebElement, flattenContexts, isDocument } from '@pe/builder/render-utils';
import { PebQueryViewBBoxAction, PebRendererService, PebUpdateViewBBoxAction, PebViewClearAction, PebViewSetAction } from '@pe/builder/renderer';
import { PebEditorState, PebElementsState, PebGetPageElements, PebOptionsState, PebPatchBBoxELementsAction, PebSetAllELementsAction, PebSetBBoxELementsAction, PebSetDocumentAction } from '@pe/builder/state';
import { PebDefRTree } from '@pe/builder/tree';
import { PebViewContextRenderAllAction, PebViewContextSetAction } from '@pe/builder/view-actions';
import { PebViewContextRenderService } from '@pe/builder/view-handlers';

@Injectable()
export class PebRenderActionHandler implements OnDestroy {
    @Select(PebElementsState.document) private readonly document$!: Observable<PebElement>;
    @Select(PebEditorState.elements) private readonly elementDefs$!: Observable<{ [id: string]: PebElementDef }>;
    @Select(PebEditorState.masterElements) private readonly masterElementDefs$!: Observable<{ [id: string]: PebElementDef }>;
    @Select(PebEditorState.screens) private readonly screens$!: Observable<PebScreen[]>;
    @Select(PebEditorState.activePage) private readonly activePage$!: Observable<PebPage>;
    @Select(PebOptionsState.screen) private readonly screen$!: Observable<PebScreen>;
    @Select(PebOptionsState.language) private readonly language$!: Observable<PebLanguage>;

    sizeUpdates: SizeUpdateModel = {};
    documentElement: PebElement;
    patchMode: PebEditorPatchMode | undefined;

    private readonly destroy$ = new Subject<void>();

    private elementDefChange$ = this.elementDefs$.pipe(tap(() => this.store.dispatch(new PebRenderPebElementsAction())));
    private masterElementDefsChange$ = this.masterElementDefs$.pipe(tap(() => this.store.dispatch(new PebRenderPebElementsAction())));

    private screenChange$ = this.screen$.pipe(
        filter(screen => !!screen),
        distinctUntilChanged((scr1, scr2) => scr1.key === scr2.key && scr1.width === scr2.width && scr1.padding === scr2.padding),
        tap(() => this.reset()),
    );

    private languageChange$ = this.language$.pipe(
        filter(language => !!language),
        distinctUntilChanged((a, b) => a.key === b.key),
        tap(() => this.reset()),
    );

    private setPatchMode$ = this.actions$.pipe(
        ofActionDispatched(PebSetRenderPatchModeAction),
        tap((action: PebSetRenderPatchModeAction) => this.patchMode = action.mode),
    )

    private activePageChange$ = this.activePage$.pipe(
        distinctUntilChanged(distinctById),
        tap(() => this.reset()),
    );

    private renderPebElements$ = this.actions$.pipe(
        ofActionDispatched(PebRenderPebElementsAction),
        withLatestFrom(this.elementDefs$, this.masterElementDefs$, this.screen$, this.language$, this.screens$, this.activePage$),
        map(([action, elements, masterElements, screen, language, screens, activePage]: any) => {
            if (!elements || !screen || !language || !activePage || activePage.master?.page && !masterElements) {
                return undefined;
            }

            const models = elementModels(elements, screen, language, screens, masterElements);
            this.store.dispatch(new PebSetAllELementsAction(models.elements));

            return onlyVisibleElements(models.elements);
        }),
        filter(elements => !!elements),
        switchMap(elements => this.resolveContext$(elements)),
        map(elements => ({ elements, document: elements?.find(isDocument) })),
        filter(({ document }) => !!document),
        tap(({ elements, document }) => {
            this.patchMode = undefined;
            const viewModels = this.rendererService.renderElements(elements, { editMode: true });
            this.store.dispatch(new PebViewSetAction(viewModels));

            this.applyBBoxUpdates(document, this.sizeUpdates);

            const toUpdate = elements.map(elm => elm.id);
            this.store.dispatch(new PebQueryViewBBoxAction(toUpdate));
        }),
        this.handleError(),
    );

    handleBboxUpdates$ = this.actions$.pipe(
        ofActionDispatched(PebUpdateViewBBoxAction),
        withLatestFrom(this.document$),
        tap(([action, document]: [PebUpdateViewBBoxAction, PebElement]) => {
            Object.entries(action.updates).forEach(([key, value]) => this.sizeUpdates[key] = value);
            this.applyBBoxUpdates(document, this.sizeUpdates);
        }),
        this.handleError(),
    );

    constructor(
        private readonly store: Store,
        private readonly actions$: Actions,
        private route: ActivatedRoute,
        private readonly rendererService: PebRendererService,
        private contextRenderService: PebViewContextRenderService,
        private readonly tree: PebDefRTree,
        private readonly controlsService: PebControlsService,
    ) {
        merge(
            this.renderPebElements$,
            this.elementDefChange$,
            this.masterElementDefsChange$,
            this.screenChange$,
            this.languageChange$,
            this.activePageChange$,
            this.handleBboxUpdates$,
            this.setPatchMode$,
        ).pipe(
            this.handleError(),
            takeUntil(this.destroy$),
        ).subscribe();

        const page = this.store.selectSnapshot(PebEditorState.activePage);
        this.store.dispatch(new PebGetPageElements(page));
    }

    ngOnDestroy(): void {
        this.destroy$.next();
    }

    reset() {
        this.sizeUpdates = {};
        this.patchMode = undefined;
        this.controlsService.renderControls([]);
        this.store.dispatch(new PebViewClearAction());
        this.store.dispatch(new PebRenderPebElementsAction());
    }

    private resolveContext$(elements: PebElement[]): Observable<PebElement[]> {
        const rootElement = elements.find(isDocument);
        if (!rootElement) {
            return of(elements);
        }

        const elementsWithIntegration = toElementWithIntegrationTree(rootElement);

        const rootContext$ = this.contextRenderService.createRootContext$();

        return rootContext$.pipe(
            switchMap(() => this.contextRenderService.resolveContext$(elementsWithIntegration).pipe(
                tap((context) => {
                    this.store.dispatch(new PebViewContextSetAction(flattenContexts(context)));
                    this.store.dispatch(new PebViewContextRenderAllAction());
                  }),
                map(() => elements),
            )),
        );
    }

    private handleError() {
        return catchError((err, caught) => {
            console.error(err);

            return caught;
        });
    }

    applyBBoxUpdates(document: PebElement, updates: SizeUpdateModel) {
        if (this.patchMode === PebEditorPatchMode.Move) {
            return;
        }

        const clonedDocument = clonePebElement(document);

        applyDocumentBBoxUpdate(clonedDocument, this.sizeUpdates);

        const elements = onlyVisibleElements(Object.values(flattenElements(clonedDocument)));

        if (this.patchMode) {
            this.store.dispatch(new PebPatchBBoxELementsAction(elements));
        } else {
            this.store.dispatch(new PebSetDocumentAction(clonedDocument));
            this.store.dispatch(new PebSetBBoxELementsAction(elements));

            this.tree.clear();
            this.tree.load(elements);
        }
    }
}

const distinctById = (a: any, b: any): boolean => a?.id === b?.id;

type SizeUpdateModel = { [id: string]: { width: number; height: number } };
