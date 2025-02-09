import { Component } from '@angular/core';

@Component({
  selector: 'list-navigation-example',
  templateUrl: 'list-navigation-example.component.html',
  styles: [`
    :host {
      display: block;
      max-width: 400px;
    }
  `]
})
export class ListNavigationExampleComponent {

  vegetableList: string[] = ['Pepper', 'Salt', 'Paprika', 'Cabbage', 'Potato', 'Onion'];

  onClick(name: string): void {
    alert('Clicked ' + name);
  }
}
