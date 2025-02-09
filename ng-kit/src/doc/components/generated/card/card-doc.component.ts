import { Component, ViewChild, TemplateRef } from '@angular/core';
import { DocContentSettingsInterface } from '../../../modules/example-viewer';

@Component({
  selector: 'doc-card',
  templateUrl: 'card-doc.component.html'
})
export class CardDocComponent {

  settings: DocContentSettingsInterface;

  @ViewChild('exampleDefault', { static: true }) exampleDefault: TemplateRef<any>;

  ngOnInit(): void {
    this.settings = {
      title: 'MenuComponent',
      import: 'import { CardModule } from \'@pe/ng-kit/modules/card\';',
      sourcePath: 'card/src/components/card/card.component',
      examples: [
        {
          title: 'Default',
          tsExample: require('!!raw-loader!./examples/card-default-example/card-default-example.component.ts'),
          htmlExample: require('!!raw-loader!./examples/card-default-example/card-default-example.component.html'),
          content: this.exampleDefault
        }
      ]
    };
  }

}
