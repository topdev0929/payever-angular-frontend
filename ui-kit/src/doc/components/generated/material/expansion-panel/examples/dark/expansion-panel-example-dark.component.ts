import { Component } from '@angular/core';

@Component({
  selector: 'doc-expansion-panel-example-dark',
  templateUrl: './expansion-panel-example-dark.component.html',
  styleUrls: ['./expansion-panel-example-dark.component.scss']
})
export class ExpansionPanelExampleDarkComponent {
  panelOpenState: boolean = false;

  vegetableList: string[] = ['Pepper', 'Salt', 'Paprika', 'Cabbage', 'Potato', 'Onion'];
}
