import { Component, OnInit, ViewChild, TemplateRef } from '@angular/core';

import { DocContentSettingsInterface } from '../../../../../modules/example-viewer';

@Component({
  selector: 'doc-test-override-change-detection-strategy-helper',
  templateUrl: './override-change-detection-strategy-helper.component.html',
})
export class TestDocsOverrideChangeDetectionStrategyHelperComponent implements OnInit {

  settings: DocContentSettingsInterface;

  tsExample: string = require('!!raw-loader!./examples/override-change-detection-strategy-helper.example.ts');

  @ViewChild('overview', { static: true }) overview: TemplateRef<any>;

  ngOnInit(): void {
    this.settings = {
      title: 'overrideChangeDetectionStrategyHelper()',
      overview: this.overview,
      examples: [{
        title: 'overrideChangeDetectionStrategyHelper()',
        tsExample: this.tsExample,
      }]
    };
  }

}
