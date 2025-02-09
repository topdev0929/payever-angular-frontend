import { Component, ViewChild, TemplateRef } from '@angular/core';
import { DocContentSettingsInterface } from '../../../../modules/example-viewer';

@Component({
  selector: 'doc-progress-button',
  templateUrl: 'progress-button-doc.component.html'
})
export class ProgressButtonDocComponent {

  settings: DocContentSettingsInterface;

  @ViewChild('exampleDefault', { static: true }) exampleDefault: TemplateRef<any>;

  ngOnInit(): void {
    this.settings = {
      title: 'Progress Button Content Component',
      import: 'import { ButtonModule } from \'@pe/ng-kit/modules/button\';',
      sourcePath: 'button/progress-button-content/progress-button-content.component',
      examples: [
        {
          title: 'Default',
          tsExample: require('!!raw-loader!./examples/default/progress-button-example.component.ts'),
          htmlExample: require('!!raw-loader!./examples/default/progress-button-example.component.html'),
          content: this.exampleDefault
        }
      ]
    };
  }

}
