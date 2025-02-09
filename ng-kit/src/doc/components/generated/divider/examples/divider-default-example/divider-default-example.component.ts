import { Component } from '@angular/core';

@Component({
  selector: 'divider-default-example',
  templateUrl: 'divider-default-example.component.html',
  styleUrls: ['divider-default-example.component.scss']
})
export class DividerDefaultExampleComponent {
  listItems: string[] = [
    'First',
    'Second',
    'Third',
    'Fourth',
    'Fifth'
  ];
}
