import { Component, Input, Output, EventEmitter } from '@angular/core';
import { IFilterItem } from './filter-interface';

@Component({
  selector: 'pe-filter',
  templateUrl: 'filter.component.html'
})
export class FilterComponent {

  @Input() itemsList: IFilterItem[];
  @Input() filterName: string;
  @Input() filterTitle: string;
  @Input() filterBtnClasses: string;
  @Output('selectItemEvent') selectItemEvent: EventEmitter< { event: MouseEvent, item: IFilterItem } > = new EventEmitter();

  onItemSelect(event: MouseEvent, item: IFilterItem): boolean {
      this.selectItemEvent.emit({'event': event, 'item': item});
      if ( typeof item.onSelect === 'function') {
        item.onSelect(event , item);
      }
      return false;
  }
}
