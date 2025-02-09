import { Component, ViewChild, TemplateRef, OnInit } from '@angular/core';

import { DocContentSettingsInterface } from '../../../../../modules/example-viewer';

@Component({
  selector: 'docs-top-location-service',
  templateUrl: './top-location-service-docs.component.html'
})
export class DocTopLocationServiceComponent implements OnInit {

  settings: DocContentSettingsInterface;

  @ViewChild('exampleTopLocationServiceInUse', { static: true }) exampleTopLocationServiceInUse: TemplateRef<any>;
  @ViewChild('overview', { static: true }) overview: TemplateRef<any>;

  ngOnInit(): void {
    this.settings = {
      title: 'TopLocationService',
      import: `import { LocationModule, TopLocationService } from '@pe/ng-kit/modules/location';`,
      sourcePath: 'location/src/services/top-location/top-location.service',
      overview: this.overview,
      examples: [
        {
          title: 'TopLocationService In Use',
          tsExample: require('!!raw-loader!./examples/in-use/top-location-service-in-use.component.ts'),
          htmlExample: require('!!raw-loader!./examples/in-use/top-location-service-in-use.component.html'),
          content: this.exampleTopLocationServiceInUse,
        },
      ]
    };
  }

}
