import { Component, ViewChild, TemplateRef } from '@angular/core';
import { DocContentSettingsInterface } from '../../../modules/example-viewer';

@Component({
  selector: 'doc-welcome-screen',
  templateUrl: 'welcome-screen-doc.component.html'
})
export class WelcomeScreenDocComponent {

  settings: DocContentSettingsInterface;

  @ViewChild('exampleDefault', { static: true }) exampleDefault: TemplateRef<any>;

  ngOnInit(): void {
    this.settings = {
      title: 'OverlayBoxModule',
      import: 'import { OverlayBoxModule } from \'@pe/ng-kit/modules/overlay-box\';',
      sourcePath: 'overlay-box/src/components/welcome-screen/welcome-screen.component',
      examples: [
        {
          title: 'Default',
          tsExample: require('!!raw-loader!./examples/welcome-screen-example/welcome-screen-example.component.ts'),
          htmlExample: require('!!raw-loader!./examples/welcome-screen-example/welcome-screen-example.component.html'),
          content: this.exampleDefault
        }
      ]
    };
  }

}
