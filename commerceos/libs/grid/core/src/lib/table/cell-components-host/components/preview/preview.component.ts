import { ChangeDetectionStrategy, Component, EventEmitter, HostBinding, Input, Output } from '@angular/core';

import { PeGridItem } from '../../../../misc/interfaces';

@Component({
  selector: 'pe-view-btn',
  template: `
   <button class="cell-preview" (click)="onCLick($event)">
     {{'grid.items.preview' | translate}}
   </button>
  `,
  styleUrls: ['./preview.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})

export class PeGridTablePreviewCellComponent {
  @Input() item: PeGridItem;
  @Input() inMobile = false;

  @Output() preview = new EventEmitter<PeGridItem>();

  @HostBinding('class.is-mobile') get mobile() {
    return this.inMobile;
  }

  onCLick(e: Event) {
    e.preventDefault();
    e.stopPropagation();
    this.preview.emit(this.item);
  }
}
