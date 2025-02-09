import { Component, Input } from '@angular/core';

@Component({
  selector: 'divider',
  templateUrl: 'divider.component.html'
})
export class DividerComponent {
  @Input() inset: boolean = false;
  @Input() vertical: boolean = false;
}
