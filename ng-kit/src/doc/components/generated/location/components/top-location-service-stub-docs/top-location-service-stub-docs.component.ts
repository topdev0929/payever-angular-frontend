import { Component, ViewChild, TemplateRef, OnInit } from '@angular/core';

import { DocContentSettingsInterface } from '../../../../../modules/example-viewer';

@Component({
  selector: 'docs-top-location-service-stub',
  templateUrl: './top-location-service-stub-docs.component.html'
})
export class DocTopLocationServiceStubComponent implements OnInit {

  settings: DocContentSettingsInterface;

  @ViewChild('overview', { static: true }) overview: TemplateRef<any>;

  ngOnInit(): void {
    this.settings = {
      title: 'TopLocationStubService',
      import: [
        `import { TopLocationStubService } from '@pe/ng-kit/modules/location';`,
        `import { LocationTestingModule } from '@pe/ng-kit/modules/location/testing';`
      ]
        .map(str => str.trim())
        .join('\n'),
      sourcePath: 'location/src/services/top-location/top-location.stub.service',
      overview: this.overview,
      examples: [
        {
          title: 'TopLocationStubService In Tests',
          tsExample: require('!!raw-loader!./examples/in-tests/top-location-stub-service-in-tests.example.ts'),
        },
      ]
    };
  }

}
