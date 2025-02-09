import { Component, ViewEncapsulation, Input, Output, EventEmitter, ViewChild } from '@angular/core';
import { MatSelectionList, MatSelectionListChange } from '@angular/material/list';
import { ListOptionSettingsInterface, SelectionListChangeInterface } from '../../interfaces';

@Component({
  selector: 'pe-selection-list',
  templateUrl: 'selection-list.component.html',
  encapsulation: ViewEncapsulation.None,
  providers: [MatSelectionList]
})
export class SelectionListComponent {

  @Input() disableRipple: boolean;
  @Input() disabled: boolean;
  @Input() options: ListOptionSettingsInterface[];

  @Output() selectionChange: EventEmitter<SelectionListChangeInterface> = new EventEmitter<SelectionListChangeInterface>();

  @ViewChild('selectionList', { static: true }) selectionList: MatSelectionList;

  deselectAll(): void {
    this.selectionList.deselectAll();
  }

  focus(): void {
    this.selectionList.focus();
  }

  selectAll(): void {
    this.selectionList.selectAll();
  }

  onSelectionChanged(event: MatSelectionListChange): void {
    this.selectionChange.emit({
      selected: event.option.selected,
      value: event.option.value
    });
  }

}
