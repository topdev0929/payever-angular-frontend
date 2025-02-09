import { Component } from '@angular/core';

@Component({
  selector: 'doc-typography',
  templateUrl: './typography-doc.component.html'
})
export class TypographyMatDocComponent {
  typographyDefaultExampleTemplate: string = require('!!raw-loader!./examples/headings/typography-example-headings.component.html');
  typographyDefaultExampleComponent: string = require('!!raw-loader!./examples/headings/typography-example-headings.component.ts');

  typographyWeightExampleTemplate: string = require('!!raw-loader!./examples/weight/typography-example-weight.component.html');
  typographyWeightExampleComponent: string = require('!!raw-loader!./examples/weight/typography-example-weight.component.ts');
}
