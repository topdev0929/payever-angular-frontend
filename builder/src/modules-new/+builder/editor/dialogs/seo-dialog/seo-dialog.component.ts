import { Component, OnDestroy, ViewEncapsulation } from '@angular/core';
import { fromPairs } from 'lodash-es';
import { combineLatest, Observable } from 'rxjs';
import { map, tap } from 'rxjs/operators';

import { PebTheme, PebThemeStore, PebPage } from '@pe/builder-core';

export interface SeoFormInputs {
  title: string;
  url: string;
  description: string;
  showInSearchResults: boolean;
  canonical: string;
  markup: string;
  tags: string;
}

@Component({
  selector: 'pe-builder-seo-dialog',
  templateUrl: 'seo-dialog.component.html',
  styleUrls: ['seo-dialog.component.scss'],
  encapsulation: ViewEncapsulation.Emulated,
})
export class SeoDialogComponent implements OnDestroy {
  initialData$: Observable<SeoFormInputs> = combineLatest([
    this.themeStore.activePage$ as Observable<PebPage>,
    this.themeStore.theme$ as Observable<PebTheme>,
  ]).pipe(
    map(([activePage, theme]) => {
      const { id, title, description, showInSearchResults, canonical, markup, tags } = (activePage as any);
      const route = theme.routing.find(r => r.pageId === id);

      return {
        title,
        url: route ? route.url : null,
        description,
        showInSearchResults,
        canonical,
        markup,
        tags,
      };
    }),
    tap(value => (this.initialValue = value)),
  );

  private initialValue: SeoFormInputs;

  private updatedValue: SeoFormInputs;

  constructor(public themeStore: PebThemeStore) {}

  onChangedForm(value: SeoFormInputs): void {
    this.updatedValue = value;
  }

  ngOnDestroy(): void {
    if (!this.updatedValue) {
      return;
    }

    const changes = fromPairs(
      Object.entries(this.updatedValue).filter(([key, value]) => this.initialValue[key] !== value),
    );

    this.themeStore.updatePageData(this.themeStore.activePageSubject$.value.id, changes);
  }
}
