import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'pe-data-grid-pagination',
  templateUrl: 'pagination.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DataGridPaginationComponent {

  @Input() length: number;
  @Input() page: number;
  @Input() pageIndex: number;
  @Input() pageSize: number;

  @Output() pageSelect: EventEmitter<number> = new EventEmitter<number>();

}
