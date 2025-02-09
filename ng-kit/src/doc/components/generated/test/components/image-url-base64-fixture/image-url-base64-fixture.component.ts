import { Component, OnInit, ViewChild, TemplateRef } from '@angular/core';

import { DocContentSettingsInterface } from '../../../../../modules/example-viewer';

@Component({
  selector: 'doc-test-image-url-base64-fixture',
  templateUrl: './image-url-base64-fixture.component.html',
})
export class TestDocsImageUrlBase64FixtureComponent implements OnInit {

  settings: DocContentSettingsInterface;

  tsExample: string = require('!!raw-loader!./examples/image-url-base64-fixture.example.ts');

  @ViewChild('overview', { static: true }) overview: TemplateRef<any>;

  ngOnInit(): void {
    this.settings = {
      title: 'imageUrlBase64Fixture()',
      overview: this.overview,
      examples: [{
        title: 'imageUrlBase64Fixture()',
        tsExample: this.tsExample,
      }]
    };
  }

}
