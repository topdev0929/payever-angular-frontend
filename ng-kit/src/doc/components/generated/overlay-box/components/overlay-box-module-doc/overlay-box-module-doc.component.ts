import { Component, ViewChild, TemplateRef } from '@angular/core';
import { DocContentSettingsInterface } from '../../../../../modules/example-viewer';

@Component({
  selector: 'doc-overlay-box-module',
  templateUrl: 'overlay-box-module-doc.component.html'
})
export class OverlayBoxDocComponent {

  settings: DocContentSettingsInterface;

  @ViewChild('exampleInfoBox', { static: true }) exampleInfoBox: TemplateRef<any>;
  @ViewChild('exampleInfoBoxConfirm', { static: true }) exampleInfoBoxConfirm: TemplateRef<any>;
  @ViewChild('exampleContentCard', { static: true }) exampleContentCard: TemplateRef<any>;
  @ViewChild('exampleBlurDirective', { static: true }) exampleBlurDirective: TemplateRef<any>;
  @ViewChild('exampleAppContainer', { static: true }) exampleAppContainer: TemplateRef<any>;

  ngOnInit(): void {
    this.settings = {
      title: 'OverlayBoxModule',
      import: 'import { OverlayBoxModule } from \'@pe/ng-kit/modules/overlay-box\';',
      sourcePath: 'overlay-box/src/components/info-box/info-box.component',
      examples: [
        {
          title: 'Info box',
          tsExample: require('!!raw-loader!./examples/info-box-example/info-box-example.component.ts'),
          htmlExample: require('!!raw-loader!./examples/info-box-example/info-box-example.component.html'),
          content: this.exampleInfoBox
        },
        {
          title: 'Blur directive',
          tsExample: require('!!raw-loader!./examples/blur-directive-example/blur-directive.component.ts'),
          htmlExample: require('!!raw-loader!./examples/blur-directive-example/blur-directive.component.html'),
          content: this.exampleBlurDirective
        },
        {
          title: 'Content card',
          tsExample: require('!!raw-loader!./examples/content-card-example/content-card-example.component.ts'),
          htmlExample: require('!!raw-loader!./examples/content-card-example/content-card-example.component.html'),
          content: this.exampleContentCard
        },
        {
          title: 'Overlay container',
          tsExample: require('!!raw-loader!./examples/overlay-container/overlay-container-example.component.ts'),
          htmlExample: require('!!raw-loader!./examples/overlay-container/overlay-container-example.component.html'),
          content: this.exampleAppContainer
        }
      ]
    };
  }

}
