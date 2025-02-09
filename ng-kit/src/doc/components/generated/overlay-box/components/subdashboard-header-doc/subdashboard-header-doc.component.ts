import { Component, OnInit, ViewChild, TemplateRef } from '@angular/core';
import { DocContentSettingsInterface } from '../../../../../modules/example-viewer';
import { SubdashboardHeaderComponent } from '../../../../../../kit/overlay-box/src/components';

@Component({
  selector: 'doc-subdashboard-header',
  templateUrl: './subdashboard-header-doc.component.html',
})
export class SubdashboardHeaderDocComponent implements OnInit {

  settings: DocContentSettingsInterface;

  @ViewChild('overview', { static: true }) overview: TemplateRef<any>;
  @ViewChild('exampleSubdashboardHeader', { static: true }) exampleSubdashboardHeader: TemplateRef<SubdashboardHeaderComponent>;

  ngOnInit(): void {
    this.settings = {
      title: 'SubdashboardHeaderComponent',
      sourcePath: 'overlay-box/src/components/subdashboard-header/subdashboard-header.component',
      overview: this.overview,
      examples: [
        {
          title: 'SubdashboardHeaderComponent',
          tsExample: require('!!raw-loader!./examples/subdashboard-header-client/subdashboard-header-client.component.ts'),
          htmlExample: require('!!raw-loader!./examples/subdashboard-header-client/subdashboard-header-client.component.html'),
          content: this.exampleSubdashboardHeader
        },
      ]
    };
  }
}
