import { Component } from '@angular/core';

@Component({
  selector: 'doc-switcher',
  templateUrl: 'switcher-doc.component.html'
})
export class SwitcherDocComponent {

  handleOnToggle(isToggled: boolean) {
    
  }

  html1 = `
  // in template
  <pe-theme-switcher
      [isMobileSelected]="true"
      (onToggled)="handleOnToggle($event)"
  ></pe-theme-switcher>
  `;
}
