import { Component, TemplateRef, ViewChild, OnInit } from '@angular/core';

import { DocContentSettingsInterface } from '../../../modules/example-viewer';

@Component({
  selector: 'doc-phone-input',
  templateUrl: './phone-input-doc.component.html'
})
export class PhoneInputDocComponent implements OnInit {

  settings: DocContentSettingsInterface;

  @ViewChild('exampleNoValidaton', { static: true }) exampleNoValidaton: TemplateRef<any>;
  @ViewChild('exampleDefaultValidation', { static: true }) exampleDefaultValidation: TemplateRef<any>;
  @ViewChild('exampleCountryValidation', { static: true }) exampleCountryValidation: TemplateRef<any>;

  ngOnInit(): void {
    this.settings = {
      title: 'PhoneInputComponent',
      import: 'import { FormModule } from \'@pe/ng-kit/modules/form\';',
      sourcePath: 'form-components/phone-input/components/phone-input/phone-input.component',
      examples: [
        {
          title: 'Within `phoneInputValidator({ countryControl })`',
          tsExample: require('!!raw-loader!./examples/country-code-validation/phone-input-doc-example-country-code-validation.component.ts'),
          htmlExample: require('!!raw-loader!./examples/country-code-validation/phone-input-doc-example-country-code-validation.component.html'),
          content: this.exampleCountryValidation,
        },
        {
          title: 'Within `phoneInputValidator()` (without countryControl - an universal validation)',
          tsExample: require('!!raw-loader!./examples/default-validation/phone-input-doc-example-default-validation.component.ts'),
          htmlExample: require('!!raw-loader!./examples/default-validation/phone-input-doc-example-default-validation.component.html'),
          content: this.exampleDefaultValidation,
        },
        {
          title: 'Without Validation',
          tsExample: require('!!raw-loader!./examples/no-validation/phone-input-doc-example-no-validation.component.ts'),
          htmlExample: require('!!raw-loader!./examples/no-validation/phone-input-doc-example-no-validation.component.html'),
          content: this.exampleNoValidaton
        },
      ]
    };
  }
}
