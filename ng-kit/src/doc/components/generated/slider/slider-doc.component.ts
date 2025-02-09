import { Component, ViewChild, TemplateRef } from '@angular/core';
import { DocContentSettingsInterface } from '../../../modules/example-viewer';

@Component({
  selector: 'doc-slider',
  templateUrl: 'slider-doc.component.html'
})
export class SliderDocComponent {

  settings: DocContentSettingsInterface;

  @ViewChild('exampleDefault', { static: true }) exampleDefault: TemplateRef<any>;

  ngOnInit(): void {
    this.settings = {
      title: 'SliderComponent',
      import: 'import { FormModule } from \'@pe/ng-kit/modules/form\';',
      sourcePath: 'form-components/slider/components/slider/slider.component',
      examples: [
        {
          title: 'Default',
          tsExample: require('!!raw-loader!./examples/slider-default-example/slider-default-example.component.ts'),
          htmlExample: require('!!raw-loader!./examples/slider-default-example/slider-default-example.component.html'),
          content: this.exampleDefault
        }
      ]
    };
  }

}
