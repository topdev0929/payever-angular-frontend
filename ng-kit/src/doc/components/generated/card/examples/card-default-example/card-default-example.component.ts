import { Component } from '@angular/core';

@Component({
  selector: 'doc-card-default-example',
  templateUrl: 'card-default-example.component.html',
  styles: [`
    .example-header-image {
      background-image: url('https://material.angular.io/assets/img/examples/shiba1.jpg');
      background-size: cover;
    }
  `]
})
export class CardDefaultExampleDocComponent {
}
