import { Component, ViewChild, TemplateRef } from '@angular/core';
import { DocContentSettingsInterface } from '../../../modules/example-viewer';

@Component({
  selector: 'doc-choose-rate',
  templateUrl: 'choose-rate-doc.component.html'
})
export class ChooseRateDocComponent {

  settings: DocContentSettingsInterface;

  @ViewChild('exampleChooseRate', { static: true }) exampleChooseRate: TemplateRef<any>;

  ngOnInit(): void {
    this.settings = {
      title: 'ChooseRateComponent',
      import: 'import { RateModule } from \'@pe/ng-kit/modules/rate\';',
      examples: [
        {
          title: 'Choose rate',
          tsExample: require('!!raw-loader!./examples/choose-rate-example/choose-rate-example.component.ts'),
          htmlExample: require('!!raw-loader!./examples/choose-rate-example/choose-rate-example.component.html'),
          content: this.exampleChooseRate
        }
      ]
    };
  }

}
