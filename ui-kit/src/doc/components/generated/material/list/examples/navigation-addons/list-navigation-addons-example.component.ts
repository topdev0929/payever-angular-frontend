import { Component } from '@angular/core';

@Component({
  selector: 'list-navigation-addons-example',
  templateUrl: 'list-navigation-addons-example.component.html',
  styles: [`
    :host {
      display: block;
      max-width: 400px;
    }
  `]
})
export class ListNavigationAddonsExampleComponent {

  vegetableList: string[] = ['Pepper', 'Salt', 'Paprika', 'Cabbage', 'Potato', 'Onion'];

  onClick(name: string): void {
    alert('Clicked ' + name);
  }
}
