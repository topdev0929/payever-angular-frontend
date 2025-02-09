import { Component, Input, ViewEncapsulation } from '@angular/core';

@Component({
  selector: 'pe-card-content',
  templateUrl: 'card-content.component.html',
  encapsulation: ViewEncapsulation.None
})
export class CardContentComponent {

  @Input() classes: string;
}
