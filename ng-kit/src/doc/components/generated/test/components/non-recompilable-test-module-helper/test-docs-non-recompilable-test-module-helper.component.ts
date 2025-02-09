import { Component, OnInit, ViewChild, TemplateRef } from '@angular/core';

import { DocContentSettingsInterface } from '../../../../../modules/example-viewer';

@Component({
  selector: 'docs-test-non-recompilable-test-module-helper',
  templateUrl: './test-docs-non-recompilable-test-module-helper.component.html'
})
export class TestDocsNonRecompilableTestModuleHelperComponent implements OnInit {

  settings: DocContentSettingsInterface;

  tsExample: string = require('!!raw-loader!./examples/non-recompilable-test-module.example.ts');

  @ViewChild('overview', { static: true }) overview: TemplateRef<any>;

  ngOnInit(): void {
    this.settings = {
      title: 'nonRecompilableTestModuleHelper()',
      overview: this.overview,
      noDefaultExample: true,
      examples: [{
        title: 'nonRecompilableTestModuleHelper() example',
        tsExample: this.tsExample,
      }]
    };
  }

}
