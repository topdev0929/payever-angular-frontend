import { Component, ViewChild, TemplateRef } from '@angular/core';
import { DocContentSettingsInterface } from '../../../modules/example-viewer';

@Component({
  selector: 'doc-dialog',
  templateUrl: 'dialog-doc.component.html'
})
export class DialogDocComponent {

  settings: DocContentSettingsInterface;

  @ViewChild('exampleDefault', { static: true }) exampleDefault: TemplateRef<any>;
  @ViewChild('exampleData', { static: true }) exampleData: TemplateRef<any>;
  @ViewChild('exampleButtons', { static: true }) exampleButtons: TemplateRef<any>;
  @ViewChild('exampleSizes', { static: true }) exampleSizes: TemplateRef<any>;

  ngOnInit(): void {
    this.settings = {
      title: 'DialogComponent',
      import: 'import { DialogModule } from \'@pe/ng-kit/modules/dialog\';',
      sourcePath: 'dialog/src/components/dialog/dialog.component',
      examples: [
        {
          title: 'Default',
          tsExample: require('!!raw-loader!./examples/dialog-default-example/dialog-default-example.component.ts'),
          htmlExample: require('!!raw-loader!./examples/dialog-default-example/dialog-default-example.component.html'),
          content: this.exampleDefault
        },
        {
          title: 'Data manipulation',
          tsExample: require('!!raw-loader!./examples/dialog-data-example/dialog-data-example.component.ts'),
          htmlExample: require('!!raw-loader!./examples/dialog-data-example/dialog-data-example.component.html'),
          content: this.exampleData
        },
        {
          title: 'Action buttons with assigned dialog result',
          tsExample: require('!!raw-loader!./examples/dialog-buttons-example/dialog-buttons-example.component.ts'),
          htmlExample: require('!!raw-loader!./examples/dialog-buttons-example/dialog-buttons-example.component.html'),
          content: this.exampleButtons
        },
        {
          title: 'Different sizes',
          tsExample: require('!!raw-loader!./examples/dialog-sizes-example/dialog-sizes-example.component.ts'),
          htmlExample: require('!!raw-loader!./examples/dialog-sizes-example/dialog-sizes-example.component.html'),
          content: this.exampleSizes
        }
      ]
    };
  }

}
