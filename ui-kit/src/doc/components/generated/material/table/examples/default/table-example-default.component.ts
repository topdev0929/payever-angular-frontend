import { Component } from '@angular/core';

@Component({
  selector: 'doc-table-example-default',
  templateUrl: './table-example-default.component.html',
  styleUrls: ['./table-example-default.component.scss']
})
export class TableExampleDefaultComponent {
  displayedColumns: string[] = ['name', 'totalTitle', 'count', 'total'];
  dataSource: PeriodicElement[] = ELEMENT_DATA;
}

export interface PeriodicElement {
  name: string;
  totalTitle: string;
  count: string;
  total: string;
}

const ELEMENT_DATA: PeriodicElement[] = [
  {name: 'AirPods', totalTitle: '', count: '1', total: '142.00'},
  {name: '', totalTitle: '<span class="text-secondary">SubTotal:</span>', count: '142.00', total: ''},
  {name: '', totalTitle: 'Total:', count: '142.00', total: ''}
];
