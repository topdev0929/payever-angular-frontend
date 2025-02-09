import { Component, Input, ViewEncapsulation } from '@angular/core';

@Component({
  selector: 'pe-card-actions',
  templateUrl: 'card-actions.component.html',
  encapsulation: ViewEncapsulation.None
})
export class CardActionsComponent {

  @Input() classes: string;
}
