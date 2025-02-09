import { Component, ViewChild, TemplateRef } from '@angular/core';
import { DocContentSettingsInterface } from '../../../modules/example-viewer';

@Component({
  selector: 'doc-data-grid',
  templateUrl: 'data-grid-doc.component.html'
})
export class DataGridDocComponent {

  settings: DocContentSettingsInterface;

  @ViewChild('exampleDefault', { static: true }) exampleDefault: TemplateRef<any>;

  ngOnInit(): void {
    this.settings = {
      title: 'Data grid',
      import: 'import { DataGridModule } from \'@pe/ng-kit/modules/data-grid\';',
      examples: [
        {
          title: 'Default',
          tsExample: require('!!raw-loader!./examples/data-grid-example/data-grid-example.component.ts'),
          htmlExample: require('!!raw-loader!./examples/data-grid-example/data-grid-example.component.html'),
          content: this.exampleDefault
        }
      ]
    };
  }

}
