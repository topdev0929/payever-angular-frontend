import { Component, OnInit, ViewChild, TemplateRef } from '@angular/core';
import { DocContentSettingsInterface } from '../../../modules/example-viewer';

@Component({
  selector: 'doc-menu',
  templateUrl: './menu-doc.component.html'
})
export class MenuDocComponent implements OnInit {

  settings: DocContentSettingsInterface;

  @ViewChild('exampleDefault', { static: true }) exampleDefault: TemplateRef<any>;

  ngOnInit(): void {
    this.settings = {
      title: 'MenuComponent',
      import: 'import { MenuModule } from \'@pe/ng-kit/modules/menu\';',
      sourcePath: 'menu/src/components/menu/menu.component',
      examples: [
        {
          title: 'Default',
          tsExample: require('!!raw-loader!./examples/default/menu-example-default.component.ts'),
          htmlExample: require('!!raw-loader!./examples/default/menu-example-default.component.html'),
          content: this.exampleDefault
        }
      ]
    };
  }
}
