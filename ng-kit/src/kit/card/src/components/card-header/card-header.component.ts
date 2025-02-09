import { Component, Input, ViewEncapsulation } from '@angular/core';

@Component({
  selector: 'pe-card-header',
  templateUrl: 'card-header.component.html',
  encapsulation: ViewEncapsulation.None
})
export class CardHeaderComponent {

  @Input() classes: string;
}
