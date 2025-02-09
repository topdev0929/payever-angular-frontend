import { Component, ViewChild, TemplateRef } from '@angular/core';
import { DocContentSettingsInterface } from '../../../modules/example-viewer';

@Component({
  selector: 'doc-color-picker',
  templateUrl: 'color-picker-doc.component.html'
})
export class ColorPickerDocComponent {

  settings: DocContentSettingsInterface;

  @ViewChild('exampleDefault', { static: true }) exampleDefault: TemplateRef<any>;

  ngOnInit(): void {
    this.settings = {
      title: 'ColorPickerComponent',
      import: 'import { FormModule } from \'@pe/ng-kit/modules/form\';',
      sourcePath: 'form-components/color-picker/components/color-picker/color-picker.component',
      examples: [
        {
          title: 'Default',
          tsExample: require('!!raw-loader!./examples/color-picker-default-example/color-picker-default-example.component.ts'),
          htmlExample: require('!!raw-loader!./examples/color-picker-default-example/color-picker-default-example.component.html'),
          content: this.exampleDefault
        }
      ]
    };
  }

}
