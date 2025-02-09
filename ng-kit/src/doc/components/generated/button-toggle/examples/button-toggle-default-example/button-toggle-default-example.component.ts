import { Component } from '@angular/core';
import { FormControl } from '@angular/forms';

import { ButtonToggleInterface, ButtonToggleChangeEvent } from '../../../../../../kit/form';

@Component({
  selector: 'doc-button-toggle-default-example',
  templateUrl: 'button-toggle-default-example.component.html'
})
export class ButtonToggleDefaultExampleDocComponent {
  
  buttons: ButtonToggleInterface[] = [
    {
      text: 'Bold',
      value: 'bold'
    },
    {
      text: 'Italic',
      value: 'italic'
    },
    {
      text: 'Underline',
      value: 'underline'
    }
  ];
  formControl: FormControl = new FormControl();

  onChanged(event: ButtonToggleChangeEvent): void {
    
  }
}
