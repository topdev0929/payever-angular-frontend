import { Component } from '@angular/core';
import { FormControl, Validators } from '@angular/forms';

@Component({
    selector: 'doc-forms-select-example-default',
    templateUrl: 'forms-select-example-default.component.html'
})
export class FormsSelectDefaultComponent {

  animalControl = new FormControl('', [Validators.required]);

  animals = [
    {name: 'Dog', sound: 'Woof!'},
    {name: 'Cat', sound: 'Meow!'},
    {name: 'Cow', sound: 'Moo!'},
    {name: 'Fox', sound: 'Wa-pa-pa-pa-pa-pa-pow!'},
  ];
}
