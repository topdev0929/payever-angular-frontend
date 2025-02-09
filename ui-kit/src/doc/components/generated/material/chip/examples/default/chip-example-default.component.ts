import { Component } from '@angular/core';

@Component({
  selector: 'doc-chip-example-default',
  templateUrl: './chip-example-default.component.html',
  styleUrls: ['./chip-example-default.component.scss']
})
export class ChipExampleDefaultComponent {
  toggleClick(event: any) {
    event.stopPropagation();
  }
}
