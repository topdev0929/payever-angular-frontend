import { Component } from '@angular/core';

@Component({
  selector: 'doc-menu-example-with-switcher',
  templateUrl: './menu-example-with-switcher.component.html'
})
export class MenuExampleWithSwitcherComponent {
  toggleClick(event: any) {
    event.stopPropagation();
  }
}
