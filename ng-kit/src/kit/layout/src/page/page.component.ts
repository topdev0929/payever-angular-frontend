import { Component, Input } from '@angular/core';

@Component({
  selector: 'pe-layout-page',
  styleUrls: ['page.component.scss'],
  templateUrl: './page.component.html'
})
export class LayoutPageComponent {

  @Input() isCentered: boolean;

}
