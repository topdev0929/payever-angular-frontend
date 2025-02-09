import { Component } from '@angular/core';

@Component({
  selector: 'doc-nav-list-example',
  templateUrl: 'nav-list-example.component.html'
})
export class NavListExampleDocComponent {
  links: string[] = ['first', 'second', 'third'];

  onClicked(link: string): void {
    alert(`Link "${link}" was clicked`);
  }
}
