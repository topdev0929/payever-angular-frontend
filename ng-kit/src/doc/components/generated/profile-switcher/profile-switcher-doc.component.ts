import { Component } from '@angular/core';

@Component({
  selector: 'doc-profile-switcher',
  templateUrl: 'profile-switcher-doc.component.html'
})
export class ProfileSwitcherDocComponent {

  profileSwitcherExampleTemplate: string = require('!!raw-loader!./examples/profile-switcher-example/profile-switcher-example.component.html');
  profileSwitcherExampleComponent: string = require('!!raw-loader!./examples/profile-switcher-example/profile-switcher-example.component.ts');
}
