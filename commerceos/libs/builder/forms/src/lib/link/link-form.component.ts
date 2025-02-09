import { ChangeDetectionStrategy, Component } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { Select, Store } from '@ngxs/store';
import { merge as lMerge } from 'lodash';
import { combineLatest, Observable } from 'rxjs';
import { filter, map, switchMap, takeUntil, tap } from 'rxjs/operators';

import {
  isContextLink,
  PebElementDef,
  PebIntegration,
  PebLinkType,
  PebPage,
  SelectOption,
} from '@pe/builder/core';
import { PebElement } from '@pe/builder/render-utils';
import { PebEditorState, PebElementsState, PebGetPageElements, PebUpdateAction } from '@pe/builder/state';
import { PeDestroyService } from '@pe/common';

import { getLinks, PebLinkFormField } from './link-form';
import { PebLinkService } from './link.service';

@Component({
  selector: 'peb-link-form',
  templateUrl: './link-form.component.html',
  styleUrls: ['../../../../styles/src/lib/styles/_sidebars.scss', './link-form.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [PeDestroyService],
})
export class PebLinkFormComponent {
  @Select(PebElementsState.selected) private readonly selected$!: Observable<PebElement[]>;
  @Select(PebEditorState.pages) private readonly pages$!: Observable<{ [id: string]: PebPage }>;
  @Select(PebElementsState.elementsByName) private readonly elements$!: Observable<Map<string, PebElementDef>>;

  linkTypes: SelectOption[] = [
    { name: 'None', value: null },
    { name: 'Page', value: PebLinkType.InternalPage },
    { name: 'Anchor', value: PebLinkType.Anchor },
    { name: 'Custom Link', value: PebLinkType.ExternalUrl },
    { name: 'Sub Page', value: PebLinkType.ContextLink },
  ];

  form = new FormGroup({
    type: new FormControl(),
    payload: new FormGroup({}),
  });

  fields$: Observable<PebLinkFormField[]> = this.selected$.pipe(
    filter(elements => elements?.length > 0),
    map(([{ link }]) => link),
    switchMap(link =>
      combineLatest([
        combineLatest([this.pages$, this.elements$]).pipe(
          tap(([pages]) => {
            if (link?.type === PebLinkType.InternalPage && link.pageId) {
              const targetPage = pages[link.pageId];
              if (targetPage?.element && Object.keys(targetPage.element).length === 0) {
                this.store.dispatch(new PebGetPageElements(targetPage));
              }
            }
          }),
          map(([pages, elements]) => getLinks(Object.values(pages), elements, link)),
        ),
        this.linkService.links$,
      ]).pipe(
        map(([p, l]) => {
          const links = lMerge(p, l);
          const type = Array.isArray(link) ? undefined : link ? link.type : null;
          const linkType = links.find(item => item.value === type);

          return linkType?.payload ?? [];
        }),
        tap((payload) => {
          this.form.markAsPristine();

          const control = this.form.get('payload') as FormGroup;
          const existingControls = Object.keys(control.controls);
          const newControls = payload.map(ctrl => ctrl.controlName);
          const hasChanged = existingControls.join(',') !== newControls.join(',');

          if (hasChanged) {
            existingControls.forEach(name => control.removeControl(name));
            newControls.forEach(name => control.registerControl(name, new FormControl()));
          }

          const value = Array.isArray(link)
            ? { type: undefined, payload: undefined }
            : link === null || link === undefined
              ? { type: null, payload: null }
              : { type: link.type, payload: { ...link } };

          if (link?.type === PebLinkType.InternalPage && link.anchorElement) {
            (value.payload as any).anchorElement = link.anchorElement.id;
          }

          this.form.patchValue(value);
        }),
      ),
    ),
  );

  constructor(
    private readonly destroy$: PeDestroyService,
    private readonly linkService: PebLinkService,
    private readonly store: Store,
  ) {
    this.selected$.pipe(
      filter(selected => selected.length > 0),
      switchMap(selected =>
        combineLatest([this.pages$, this.elements$]).pipe(
          switchMap(([pages, elements]) =>
            this.form.valueChanges.pipe(
              filter(() => this.form.dirty),
              tap((value) => {
                const payload = selected.map((elm) => {
                  if (value.type === PebLinkType.InternalPage && value.payload.anchorElement) {
                    const page = pages[value.payload.pageId];
                    if (page?.element) {
                      const el = page.element[value.payload.anchorElement];
                      value.payload.anchorElement = { name: el.name, id: el.id };
                    }
                  }

                  const renderConfigs = {
                    ...elm.integration?.renderConfigs,
                    link: isContextLink(value)
                      ? 'context.parent.value.pageLink??context.value.pageLink'
                      : {},
                  };

                  const urlParameters = { contextId: 'context.parent.value.id??context.value.id' };

                  return {
                    id: elm.id,
                    link: value.type
                      ? {
                        type: value.type,
                        ...value.payload,
                        dynamicParams: { urlParameters },
                      }
                      : null,
                    integration: { renderConfigs } as PebIntegration,
                  };
                });

                this.store.dispatch(new PebUpdateAction(payload));
              }),
            ),
          ),
        ),
      ),
      takeUntil(this.destroy$),
    )
      .subscribe();
  }
}
