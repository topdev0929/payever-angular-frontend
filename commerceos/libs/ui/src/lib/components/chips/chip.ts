import { Component, Input } from '@angular/core';

@Component({
  // eslint-disable-next-line @angular-eslint/component-selector
  selector: 'peb-chip',
  templateUrl: './chip.html',
  styleUrls: ['./chip.scss'],
})
export class PebChipComponent {
  @Input() value: any;
}
