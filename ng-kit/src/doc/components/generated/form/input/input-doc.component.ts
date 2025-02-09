import { Component, OnInit, ViewChild, TemplateRef } from '@angular/core';
import { DocContentSettingsInterface } from '../../../../modules/example-viewer';

@Component({
  selector: 'input-doc',
  templateUrl: 'input-doc.component.html'
})
export class InputDocComponent implements OnInit {
  settings: DocContentSettingsInterface;

  @ViewChild('exampleDefault', { static: true }) exampleDefault: TemplateRef<any>;

  ngOnInit(): void {
    this.settings = {
      title: 'FormInputComponent',
      import: 'import { FormModule } from \'@pe/ng-kit/modules/form\';',
      sourcePath: 'form-components/input/components/input/input.component',
      examples: [
        {
          title: 'Default',
          tsExample: require('!!raw-loader!./examples/input-example-basic.ts'),
          htmlExample: require('!!raw-loader!./examples/input-example-basic.html'),
          content: this.exampleDefault
        },
      ]
    };
  }
}

