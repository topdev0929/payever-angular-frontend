import { Injectable, OnDestroy } from '@angular/core';
import { Actions, ofActionDispatched, Select, Store } from '@ngxs/store';
import { Observable, of, Subject } from 'rxjs';
import { filter, map, mergeMap, takeUntil, tap, withLatestFrom } from 'rxjs/operators';

import { PebDeleteElementAction } from '@pe/builder/actions';
import { PebElementType } from '@pe/builder/core';
import { PebElement } from '@pe/builder/render-utils';
import { PebDeleteAction, PebDeselectAllAction, PebElementsState, PebUpdateAction } from '@pe/builder/state';
import { ConfirmScreenService, Headings } from '@pe/confirmation-screen';
import { TranslateService } from '@pe/i18n';


@Injectable()
export class PebDeleteActionHandler implements OnDestroy {

  @Select(PebElementsState.selected) private readonly selectedElements$!: Observable<PebElement[]>;

  private destroy$ = new Subject<void>();

  constructor(
    private actions$: Actions,
    private store: Store,
    private confirmScreenService: ConfirmScreenService,
    private translateService: TranslateService,
  ) {
    this.actions$.pipe(
      ofActionDispatched(PebDeleteElementAction),
      withLatestFrom(this.selectedElements$),
      mergeMap(([, selectedElements]) => {
        const sections = selectedElements.filter(el => el.type === PebElementType.Section);

        if (sections.length === 1 && sections[0].parent.children.length === 1) {
          const headings: Headings = {
            title: this.translateService.translate('builder-app.actions.error'),
            subtitle: this.translateService.translate('builder-app.delete.delete_all_section_error'),
            confirmBtnText: this.translateService.translate('builder-app.actions.close'),
            declineBtnText: '',
          };
          this.showConfirmationDialog(headings).pipe(
            takeUntil(this.destroy$)
          ).subscribe();
        }

        const indelibleSections = sections.filter(el => el.meta?.deletable === false);
        if (indelibleSections.length) {
          const headings: Headings = {
            title: this.translateService.translate('builder-app.actions.error'),
            subtitle: this.translateService.translate('builder-app.delete.delete_default_section_error'),
            confirmBtnText: this.translateService.translate('builder-app.delete.change_default'),
            declineBtnText: this.translateService.translate('builder-app.actions.close'),
          };
          this.showConfirmationDialog(headings).pipe(
            tap(() => {
              const payload = indelibleSections.map(({ id }) => ({ id, meta: { deletable: null } }));

              this.store.dispatch(new PebUpdateAction(payload));
            }),
            takeUntil(this.destroy$)
          ).subscribe();
        }

        return of(selectedElements);
      }),
      map(selectedElements => selectedElements.reduce((elements, elm) => {
        const canDelete = elm.meta?.deletable !== false
          && elm.type !== PebElementType.Document
          && elm.parent.type !== PebElementType.Grid;

        if (canDelete) {
          const toArray = (elm: PebElement, acc: Set<PebElement>): Set<PebElement> => {
            if (!acc.has(elm)) {
              acc.add(elm);
              for (const e of elm.children) {
                toArray(e, acc);
              }
            }

            return acc;
          };

          toArray(elm, elements);
        }

        return elements;
      }, new Set<PebElement>())),
      map(value => [...value]),
      filter(elements => !!elements.length),
      tap((elements) => {
        this.store.dispatch([
          new PebDeleteAction(elements),
          new PebDeselectAllAction(),
        ]);
      }),
      takeUntil(this.destroy$),
    ).subscribe();
  }

  private showConfirmationDialog(headings: Headings) {

    return this.confirmScreenService.show(headings, true).pipe(
      filter(val => !!val),
      takeUntil(this.destroy$),
    );
  }

  ngOnDestroy(): void {
    this.destroy$.next();
  }
}
