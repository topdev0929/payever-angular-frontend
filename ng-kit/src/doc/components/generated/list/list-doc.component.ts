import { Component, ViewChild, TemplateRef } from '@angular/core';
import { DocContentSettingsInterface } from '../../../modules/example-viewer';

@Component({
  selector: 'doc-list',
  templateUrl: 'list-doc.component.html'
})
export class ListDocComponent {

  settings: DocContentSettingsInterface;

  @ViewChild('exampleDefault', { static: true }) exampleDefault: TemplateRef<any>;
  @ViewChild('exampleNav', { static: true }) exampleNav: TemplateRef<any>;
  @ViewChild('exampleSelection', { static: true }) exampleSelection: TemplateRef<any>;

  ngOnInit(): void {
    this.settings = {
      title: 'ListComponent',
      import: 'import { ListModule } from \'@pe/ng-kit/modules/list\';',
      sourcePath: 'list/src/components/list/list.component',
      examples: [
        {
          title: 'Default',
          tsExample: require('!!raw-loader!./examples/list-default-example/list-default-example.component.ts'),
          htmlExample: require('!!raw-loader!./examples/list-default-example/list-default-example.component.html'),
          content: this.exampleDefault
        },
        {
          title: 'Navigation List',
          tsExample: require('!!raw-loader!./examples/nav-list-example/nav-list-example.component.ts'),
          htmlExample: require('!!raw-loader!./examples/nav-list-example/nav-list-example.component.html'),
          content: this.exampleNav
        },
        {
          title: 'Selection List',
          tsExample: require('!!raw-loader!./examples/selection-list-example/selection-list-example.component.ts'),
          htmlExample: require('!!raw-loader!./examples/selection-list-example/selection-list-example.component.html'),
          content: this.exampleSelection
        }
      ]
    };
  }
}
