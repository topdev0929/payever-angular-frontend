import { Component, ViewChild, TemplateRef } from '@angular/core';
import { DocContentSettingsInterface } from '../../../modules/example-viewer';

@Component({
  selector: 'doc-choose-rate-accordion',
  templateUrl: 'choose-rate-accordion-doc.component.html'
})
export class ChooseRateAccordionDocComponent {

  settings: DocContentSettingsInterface;

  @ViewChild('exampleChooseRate', { static: true }) exampleChooseRate: TemplateRef<any>;

  ngOnInit(): void {
    this.settings = {
      title: 'ChooseRateAccordionComponent',
      import: 'import { RateModule } from \'@pe/ng-kit/modules/rate\';',
      examples: [
        {
          title: 'Choose rate accordion',
          tsExample: require('!!raw-loader!./examples/choose-rate-accordion-example/choose-rate-accordion-example.component.ts'),
          htmlExample: require('!!raw-loader!./examples/choose-rate-accordion-example/choose-rate-accordion-example.component.html'),
          content: this.exampleChooseRate
        }
      ]
    };
  }

}
