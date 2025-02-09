import { Component } from '@angular/core';
import { FormControl } from '@angular/forms';

import { ButtonToggleInterface, ButtonToggleChangeEvent } from '../../../../../../kit/form';

@Component({
  selector: 'doc-button-toggle-icon-example',
  templateUrl: 'button-toggle-icon-example.component.html'
})
export class ButtonToggleIconExampleDocComponent {
  
  buttons: ButtonToggleInterface[] = [
    {
      icon: 'icon-ep-space-centered',
      iconSize: 32,
      value: 'center'
    },
    {
      icon: 'icon-ep-space-medium',
      iconSize: 32,
      value: 'medium'
    },
    {
      icon: 'icon-ep-space-small',
      iconSize: 32,
      value: 'small',
      disabled: true
    }
  ];
  formControl: FormControl = new FormControl();

  onChanged(event: ButtonToggleChangeEvent): void {
    
  }
}
