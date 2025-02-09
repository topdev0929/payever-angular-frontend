import { Component } from '@angular/core';

@Component({
  selector: 'doc-rate',
  templateUrl: './rate-doc.component.html'
})
export class RateDocComponent {
  rateDefaultExampleTemplate: string = require('!!raw-loader!./examples/default/rate-example-default.component.html');
  rateDefaultExampleComponent: string = require('!!raw-loader!./examples/default/rate-example-default.component.ts');

  rateEditExampleTemplate: string = require('!!raw-loader!./examples/edit/rate-example-edit.component.html');
  rateEditExampleComponent: string = require('!!raw-loader!./examples/edit/rate-example-edit.component.ts');

  rateTitleExampleTemplate: string = require('!!raw-loader!./examples/title/rate-example-title.component.html');
  rateTitleExampleComponent: string = require('!!raw-loader!./examples/title/rate-example-title.component.ts');

  rateLoadingExampleTemplate: string = require('!!raw-loader!./examples/loading/rate-example-loading.component.html');
  rateLoadingExampleComponent: string = require('!!raw-loader!./examples/loading/rate-example-loading.component.ts');
}
