import { Component, ViewChild, TemplateRef, OnInit } from '@angular/core';

import { DocContentSettingsInterface } from '../../../../../modules/example-viewer';

@Component({
  selector: 'docs-dev-mode-service-stub',
  templateUrl: './dev-mode-service-stub-docs.component.html'
})
export class DevModeServiceStubDocsComponent implements OnInit {

  settings: DocContentSettingsInterface;

  @ViewChild('overview', { static: true }) overview: TemplateRef<any>;

  ngOnInit(): void {
    this.settings = {
      title: 'DevModeStubService',
      import: `import { DevModeStubService } from '@pe/ng-kit/modules/dev';`,
      sourcePath: 'dev/src/services/dev-mode/dev-mode.service.stub',
      overview: this.overview,
      examples: [
        {
          title: 'DevModeStubService In Tests',
          tsExample: require('!!raw-loader!./examples/in-tests/dev-mode-service-stub-in-tests.example.ts'),
        }
      ]
    };
  }

}
