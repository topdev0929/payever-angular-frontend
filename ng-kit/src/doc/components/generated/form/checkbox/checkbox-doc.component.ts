import { Component, OnInit, ViewChild, TemplateRef } from '@angular/core';
import { DocContentSettingsInterface } from '../../../../modules/example-viewer';

@Component({
  selector: 'form-checkbox-doc',
  templateUrl: 'checkbox-doc.component.html'
})
export class CheckboxDocComponent implements OnInit {

  settings: DocContentSettingsInterface;

  @ViewChild('exampleDefault', { static: true }) exampleDefault: TemplateRef<any>;

  ngOnInit(): void {
    this.settings = {
      title: 'FormCheckboxComponent',
      import: 'import { FormModule } from \'@pe/ng-kit/modules/form\';',
      sourcePath: 'form-components/checkbox/components/checkbox/checkbox.component',
      examples: [
        {
          title: 'Default',
          tsExample: require('!!raw-loader!./examples/form-checkbox-default-example/form-checkbox-default-example.component.ts'),
          htmlExample: require('!!raw-loader!./examples/form-checkbox-default-example/form-checkbox-default-example.component.html'),
          content: this.exampleDefault
        },
      ]
    };
  }
}
