import { Component, ViewChild, TemplateRef, OnInit } from '@angular/core';

import { DocContentSettingsInterface } from '../../../../../modules/example-viewer';

@Component({
  selector: 'docs-location-service',
  templateUrl: './location-service-doc.component.html'
})
export class DocLocationServiceComponent implements OnInit {

  settings: DocContentSettingsInterface;

  @ViewChild('exampleLocationServiceInUse', { static: true }) exampleLocationServiceInUse: TemplateRef<any>;
  @ViewChild('overview', { static: true }) overview: TemplateRef<any>;

  ngOnInit(): void {
    this.settings = {
      title: 'LocationService',
      import: `import { LocationModule, LocationService } from '@pe/ng-kit/modules/location';`,
      sourcePath: 'location/src/services/location/location.service',
      overview: this.overview,
      examples: [
        {
          title: 'LocationService In Use',
          tsExample: require('!!raw-loader!./examples/in-use/location-service-in-use.component.ts'),
          htmlExample: require('!!raw-loader!./examples/in-use/location-service-in-use.component.html'),
          cssExample: require('!!raw-loader!./examples/in-use/location-service-in-use.component.scss'),
          content: this.exampleLocationServiceInUse,
        },
      ]
    };
  }

}
