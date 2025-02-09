import { Component, OnInit, ViewChild, TemplateRef } from '@angular/core';

import { DocContentSettingsInterface } from '../../../../../modules/example-viewer';

@Component({
  selector: 'doc-test-fake-overlay-container',
  templateUrl: './fake-overlay-container.component.html',
})
export class TestDocsFakeOverlayContainerComponent implements OnInit {

  settings: DocContentSettingsInterface;

  tsExample: string = require('!!raw-loader!./examples/fake-overlay-container.example.ts');

  @ViewChild('overview', { static: true }) overview: TemplateRef<any>;

  ngOnInit(): void {
    this.settings = {
      title: 'fakeOverlayContainer()',
      overview: this.overview,
      examples: [{
        title: 'fakeOverlayContainer()',
        tsExample: this.tsExample,
      }]
    };
  }

}
