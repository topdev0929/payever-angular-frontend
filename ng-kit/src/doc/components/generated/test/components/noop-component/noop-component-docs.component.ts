import { Component, OnInit, ViewChild, TemplateRef } from '@angular/core';

import { DocContentSettingsInterface } from '../../../../../modules/example-viewer';

@Component({
  selector: 'doc-test-noop-component',
  templateUrl: './noop-component-docs.component.html',
})
export class TestDocsNoopComponentComponent implements OnInit {

  settings: DocContentSettingsInterface;

  tsExample: string = require('!!raw-loader!./examples/noop-component.example.ts');

  @ViewChild('overview', { static: true }) overview: TemplateRef<any>;

  ngOnInit(): void {
    this.settings = {
      title: 'NoopComponent',
      overview: this.overview,
      examples: [{
        title: 'NoopComponent',
        tsExample: this.tsExample,
      }]
    };
  }

}
