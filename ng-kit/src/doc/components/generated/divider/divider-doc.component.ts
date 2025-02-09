import { Component, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { DocContentSettingsInterface } from '../../../modules/example-viewer/src/interfaces';

@Component({
  selector: 'divider-doc',
  templateUrl: 'divider-doc.component.html'
})
export class DividerDocComponent implements OnInit {

  settings: DocContentSettingsInterface;

  @ViewChild('exampleDefault', { static: true }) exampleDefault: TemplateRef<any>;

  ngOnInit(): void {
    this.settings = {
      title: 'Divider',
      import: 'import { DividerModule } from \'@pe/ng-kit/modules/divider\';',
      sourcePath: 'divider/src/divider.component',
      examples: [
        {
          title: 'Default',
          htmlExample: require('!!raw-loader!./examples/divider-default-example/divider-default-example.component.html'),
          tsExample: require('!!raw-loader!./examples/divider-default-example/divider-default-example.component.ts'),
          content: this.exampleDefault
        }
      ]
    };
  }

}
