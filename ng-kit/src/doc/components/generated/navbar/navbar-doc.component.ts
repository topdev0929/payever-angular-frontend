import { Component, OnInit, ViewChild, TemplateRef } from '@angular/core';
import { DocContentSettingsInterface } from '../../../modules/example-viewer';

@Component({
  selector: 'navbar-doc',
  templateUrl: 'navbar-doc.component.html',
  styleUrls: ['navbar-doc.component.scss']
})
export class NavbarDocComponent {

  settings: DocContentSettingsInterface;

  @ViewChild('exampleDefault', { static: true }) exampleDefault: TemplateRef<any>;
  @ViewChild('exampleTransparent', { static: true }) exampleTransparent: TemplateRef<any>;
  @ViewChild('exampleMicro', { static: true }) exampleMicro: TemplateRef<any>;
  @ViewChild('examplePlatformHeader', { static: true }) platformHeader: TemplateRef<any>;

  ngOnInit(): void {
    this.settings = {
      title: 'NavbarComponent',
      import: 'import { NavbarModule } from \'@pe/ng-kit/modules/navbar\';',
      sourcePath: 'navbar/src/components/navbar.component',
      examples: [
        {
          title: 'Default',
          tsExample: require('!!raw-loader!./examples/navbar-default-example/navbar-default-example.component.ts'),
          htmlExample: require('!!raw-loader!./examples/navbar-default-example/navbar-default-example.component.html'),
          content: this.exampleDefault
        },
        {
          title: 'Transparent',
          tsExample: require('!!raw-loader!./examples/navbar-transparent-example/navbar-transparent-example.component.ts'),
          htmlExample: require('!!raw-loader!./examples/navbar-transparent-example/navbar-transparent-example.component.html'),
          content: this.exampleTransparent
        },
        {
          title: 'Micro',
          tsExample: require('!!raw-loader!./examples/navbar-micro-example/navbar-micro-example.component.ts'),
          htmlExample: require('!!raw-loader!./examples/navbar-micro-example/navbar-micro-example.component.html'),
          content: this.exampleMicro
        },
        {
          title: 'PlatformHeader',
          tsExample: require('!!raw-loader!./examples/platform-header-example/platform-header-example.component.ts'),
          htmlExample: require('!!raw-loader!./examples/platform-header-example/platform-header-example.component.html'),
          content: this.platformHeader
        }
      ]
    };
  }
}
