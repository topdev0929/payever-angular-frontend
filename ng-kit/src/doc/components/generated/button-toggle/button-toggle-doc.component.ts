import { Component, OnInit, ViewChild, TemplateRef } from '@angular/core';
import { DocContentSettingsInterface } from '../../../modules/example-viewer';

@Component({
  selector: 'doc-button-toggle',
  templateUrl: 'button-toggle-doc.component.html'
})
export class ButtonToggleDocComponent {

  settings: DocContentSettingsInterface;

  @ViewChild('exampleDefault', { static: true }) exampleDefault: TemplateRef<any>;
  @ViewChild('exampleIcon', { static: true }) exampleIcon: TemplateRef<any>;

  ngOnInit(): void {
    this.settings = {
      title: 'ButtonToggleGroupComponent',
      import: 'import { FormModule } from \'@pe/ng-kit/modules/form\';',
      sourcePath: 'form-components/button-toggle/components/button-toggle-group/button-toggle-group.component',
      examples: [
        {
          title: 'Default',
          tsExample: require('!!raw-loader!./examples/button-toggle-default-example/button-toggle-default-example.component.ts'),
          htmlExample: require('!!raw-loader!./examples/button-toggle-default-example/button-toggle-default-example.component.html'),
          content: this.exampleDefault
        },
        {
          title: 'Button toggle with icon',
          tsExample: require('!!raw-loader!./examples/button-toggle-icon-example/button-toggle-icon-example.component.ts'),
          htmlExample: require('!!raw-loader!./examples/button-toggle-icon-example/button-toggle-icon-example.component.html'),
          content: this.exampleIcon
        }
      ]
    };
  }

}
