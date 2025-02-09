import { Component } from '@angular/core';
import { ListOptionSettingsInterface, SelectionListChangeInterface } from '../../../../../../kit/list';

@Component({
  selector: 'doc-selection-list-example',
  templateUrl: 'selection-list-example.component.html'
})
export class SelectionListExampleDocComponent {

  options: ListOptionSettingsInterface[] = [
    {
      label: 'Boots',
      value: '1'
    },
    {
      label: 'Clogs',
      value: '2'
    },
    {
      label: 'Loafers',
      value: '3'
    },
    {
      label: 'Moccasins',
      value: '4'
    }
  ];

  onSelectionChanged(event: SelectionListChangeInterface) {
    
  }
}
