import { Component, ViewChild, TemplateRef } from '@angular/core';
import { DocContentSettingsInterface } from '../../../modules/example-viewer';

@Component({
  selector: 'doc-layout',
  templateUrl: 'layout-doc.component.html'
})
export class LayoutDocComponent {

  settings: DocContentSettingsInterface;

  @ViewChild('exampleExpandable', { static: true }) exampleExpandable: TemplateRef<any>;

  ngOnInit(): void {
    this.settings = {
      title: 'LayoutComponent',
      import: 'import { LayoutModule } from \'@pe/ng-kit/modules/layout\';',
      examples: [
        {
          title: 'Layout expandable',
          tsExample: require('!!raw-loader!./examples/layout-expandable-example/layout-expandable-example.component.ts'),
          htmlExample: require('!!raw-loader!./examples/layout-expandable-example/layout-expandable-example.component.html'),
          content: this.exampleExpandable
        }
      ]
    };
  }

}
