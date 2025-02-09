import { Component } from '@angular/core';

import { IFilterItem  } from '../../../../../modules/filter';

@Component({
  selector: 'doc-filter',
  templateUrl: 'filter-doc.component.html'
})

export class FilterDocComponent {
  htmlExample: string =  require('raw-loader!./examples/filter-example-basic.html.txt');
  tsExample: string =  require('raw-loader!./examples/filter-example-basic.ts.txt');

  itemsList: IFilterItem[] = [];
  filterName: string = 'Add filter';
  filterTitle: string = 'Choose a filter';
  filterBtnClasses: string = 'btn btn-default btn-inline btn-link';

  constructor() {
    this.itemsList = [
      {
        title: 'Select a category',
        onSelect: ( event, item ) => {
          
          
          alert('clicked');
        }
      },
      {
        title: 'Price'
      },
      {
        title: 'Stock quantity'
      }
    ];
  }

  handleSelectedFilterItem(event: {event: MouseEvent, item: IFilterItem}) {
      
  }
}
