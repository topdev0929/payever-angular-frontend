import { Component } from '@angular/core';

@Component({
  selector: 'doc-avatar',
  templateUrl: './avatar-doc.component.html'
})
export class AvatarDocComponent {
  avatarDefaultExampleTemplate: string = require('!!raw-loader!./examples/default/avatar-example-default.component.html');
  avatarDefaultExampleComponent: string = require('!!raw-loader!./examples/default/avatar-example-default.component.ts');

  avatarSquaredExampleTemplate: string = require('!!raw-loader!./examples/squared/avatar-example-squared.component.html');
  avatarSquaredExampleComponent: string = require('!!raw-loader!./examples/squared/avatar-example-squared.component.ts');
}
