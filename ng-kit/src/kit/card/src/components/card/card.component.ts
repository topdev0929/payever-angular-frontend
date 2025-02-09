import { Component, Input, ViewEncapsulation } from '@angular/core';

@Component({
  selector: 'pe-card',
  templateUrl: 'card.component.html',
  encapsulation: ViewEncapsulation.None
})
export class CardComponent {

  @Input() classes: string;
}
