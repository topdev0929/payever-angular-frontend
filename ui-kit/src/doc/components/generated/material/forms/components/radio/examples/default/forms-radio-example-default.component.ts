import { Component } from '@angular/core';

@Component({
    selector: 'doc-forms-radio-example-default',
    templateUrl: 'forms-radio-example-default.component.html'
})
export class FormsRadioDefaultComponent {

  favoriteSeason: string;

  seasons = [
    'Winter',
    'Spring',
    'Summer',
    'Autumn',
  ];
}
