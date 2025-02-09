import { Component, ViewChild, TemplateRef, OnInit } from '@angular/core';

import { DocContentSettingsInterface } from '../../../../../modules/example-viewer';

@Component({
  selector: 'docs-dev-mode-service',
  templateUrl: './dev-mode-service-docs.component.html'
})
export class DevModeServiceDocsComponent implements OnInit {

  settings: DocContentSettingsInterface;

  @ViewChild('overview', { static: true }) overview: TemplateRef<any>;
  @ViewChild('exampleDevModeServiceInUse', { static: true }) exampleDevModeServiceInUse: TemplateRef<any>;

  ngOnInit(): void {
    this.settings = {
      title: 'DevModeService',
      import: `import { DevModule, DevModeService } from '@pe/ng-kit/modules/dev';`,
      sourcePath: 'dev/src/services/dev-mode/dev-mode.service',
      overview: this.overview,
      examples: [
        {
          title: 'DevModeService In Use',
          tsExample: require('!!raw-loader!./examples/in-use/dev-mode-service-in-use.component.ts'),
          htmlExample: require('!!raw-loader!./examples/in-use/dev-mode-service-in-use.component.html'),
          content: this.exampleDevModeServiceInUse,
        },
      ]
    };
  }

}
