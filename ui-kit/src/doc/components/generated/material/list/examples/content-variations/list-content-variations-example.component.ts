import { Component } from '@angular/core';

@Component({
  selector: 'list-content-variations-example',
  templateUrl: 'list-content-variations-example.component.html',
  styleUrls: ['list-content-variations-example.component.scss']
})
export class ListContentVariationsExampleComponent {

  vegetableList: string[] = ['Pepper', 'Salt', 'Paprika'];
  iconsList: string[] = ['#icon-plus-solid-96', '#icon-brush-32', '#icon-settings-sliders-32'];
}
