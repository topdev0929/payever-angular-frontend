import { Injectable, OnDestroy } from '@angular/core';
import { BehaviorSubject, Subject } from 'rxjs';
import { takeUntil, tap } from 'rxjs/operators';

import { MessageBus } from '@pe/common';
import { PeGridItem } from '@pe/grid';

@Injectable()
export class PeGridProductsService implements OnDestroy {

  private readonly destroy$ = new Subject<void>();

  constructor(
    private messageBus: MessageBus,
  ) {
    this.messageBus
      .listen('products.clear.selectedItems')
      .pipe(
        tap(() => {
          this.selectedItems$.next([]);
        }),
        takeUntil(this.destroy$),
      ).subscribe();

    this.messageBus
      .listen('products.add.selectedItems')
      .pipe(
        tap((items) => {
          this.selectedItems$.next(items);
        }),
        takeUntil(this.destroy$),
      ).subscribe();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
  }

  items$ = new BehaviorSubject<PeGridItem[]>([]);

  set items(items: PeGridItem[]) {
    this.items$.next(items);
  }

  get items() {
    return this.items$.value;
  }

  selectedItems$ = new BehaviorSubject<PeGridItem[]>([]);

  set selectedItems(items: PeGridItem[]) {
    this.selectedItems$.next(items);
  }

  get selectedItems() {
    return this.selectedItems$.value;
  }

  get selectedItemsIds(): string[] {
    return this.getSelectedIds('item');
  }

  get selectedFoldersIds(): string[] {
    return this.getSelectedIds('folder');
  }

  restoreScroll$ = new Subject<boolean>();

  isAllSelected(): boolean {
    return this.selectedItems.length === this.items.length;
  }

  removeSelected(ids: string[]): void {
    const items = this.selectedItems.filter(item => !ids?.includes(item.id));
    this.selectedItems = items;
  }

  private getSelectedIds(type: string) {
    return this.selectedItems.filter((item: PeGridItem) => item.type === type).map((item: PeGridItem) => item.id);
  }
}
