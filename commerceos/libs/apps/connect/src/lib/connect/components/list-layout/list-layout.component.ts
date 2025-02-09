import { Component, ViewEncapsulation } from '@angular/core';


@Component({
  selector: 'connect-list-layout',
  templateUrl: './list-layout.component.html',
  styleUrls: ['../modals/modals.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class ListLayoutComponent {

  dataLoaded = false;
}
