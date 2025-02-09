import { Component } from '@angular/core';
import { DocExamples } from '../../../../../../types/doc.interface';
import { FormBuilder, FormGroup } from '@angular/forms';
import { v4 as uuid } from 'uuid';

@Component({
  selector: 'forms-checkbox',
  templateUrl: 'forms-checkbox.component.html'
})
export class FormsCheckboxMatDocComponent {
  formsCheckboxExampleTemplate: string = require('!!raw-loader!./examples/default/forms-checkbox-example-default.component.html');
  formsCheckboxExampleComponent: string = require('!!raw-loader!./examples/default/forms-checkbox-example-default.component.ts');

}
