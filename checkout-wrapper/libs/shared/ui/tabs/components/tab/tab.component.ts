import { Component, Input } from '@angular/core';

@Component({
  selector: 'ui-tab',
  templateUrl: './tab.component.html',
})
export class CheckoutUiTabComponent {
  @Input() title: string;
  @Input() active: boolean;
}
