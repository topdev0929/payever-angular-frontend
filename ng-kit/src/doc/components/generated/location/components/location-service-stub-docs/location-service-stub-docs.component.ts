import { Component, ViewChild, TemplateRef, OnInit } from '@angular/core';

import { DocContentSettingsInterface } from '../../../../../modules/example-viewer';

@Component({
  selector: 'docs-location-service-stub',
  templateUrl: './location-service-stub-docs.component.html'
})
export class DocLocationServiceStubComponent implements OnInit {

  settings: DocContentSettingsInterface;

  @ViewChild('overview', { static: true }) overview: TemplateRef<any>;

  ngOnInit(): void {
    this.settings = {
      title: 'LocationStubService',
      import: [
        `import { LocationStubService } from '@pe/ng-kit/modules/location';`,
        `import { LocationTestingModule } from '@pe/ng-kit/modules/location/testing';`
      ]
        .map(str => str.trim())
        .join('\n'),
      sourcePath: 'location/src/services/location/location.stub.service',
      overview: this.overview,
      examples: [
        {
          title: 'LocationStubService In Tests',
          tsExample: require('!!raw-loader!./examples/in-tests/location-stub-service-in-tests.example.ts'),
        },
      ]
    };
  }

}
