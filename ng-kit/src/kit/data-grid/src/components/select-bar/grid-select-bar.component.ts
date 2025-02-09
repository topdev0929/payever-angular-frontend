import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from '@angular/core';

import { DataGridSelectBarButtonInterface } from '../../interfaces';

@Component({
  selector: 'pe-data-grid-select-bar',
  templateUrl: 'grid-select-bar.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DataGridSelectBarComponent<T> {

  @Input() buttons: DataGridSelectBarButtonInterface<T>[];
  @Input() buttonsCountLimit: number = 3;
  @Input()
  set selectedItems(items: T[]) {
    this.items = items;
  }

  @Output() allSelected: EventEmitter<null> = new EventEmitter<null>();
  @Output() closed: EventEmitter<null> = new EventEmitter<null>();
  @Output() unselected: EventEmitter<null> = new EventEmitter<null>();

  items: T[] = [];

  onAllSelected(): void {
    this.allSelected.emit();
  }

  onClosed(): void {
    this.closed.emit();
  }

  onUnselected(): void {
    this.unselected.emit();
  }

}
