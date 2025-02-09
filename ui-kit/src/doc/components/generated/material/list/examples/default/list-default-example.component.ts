import { Component } from '@angular/core';

@Component({
  selector: 'list-default-example',
  templateUrl: 'list-default-example.component.html'
})
export class ListDefaultExampleComponent {
  vegetableList: string[] = ['Pepper', 'Salt', 'Paprika', 'Cabbage', 'Potato', 'Onion'];
}
