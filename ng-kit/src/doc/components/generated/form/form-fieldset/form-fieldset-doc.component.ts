import { Component, ViewChild, TemplateRef } from '@angular/core';
import { DocContentSettingsInterface } from '../../../../modules/example-viewer';

@Component({
  selector: 'form-fieldset-doc',
  templateUrl: 'form-fieldset-doc.component.html'
})
export class FormFieldsetDocComponent {

  settings: DocContentSettingsInterface;

  @ViewChild('exampleDefault', { static: true }) exampleDefault: TemplateRef<any>;
  @ViewChild('exampleLogin', { static: true }) exampleLogin: TemplateRef<any>;
  @ViewChild('exampleHideDisabled', { static: true }) exampleHideDisabled: TemplateRef<any>;
  @ViewChild('exampleNoBorder', { static: true }) exampleNoBorder: TemplateRef<any>;
  @ViewChild('exampleStore', { static: true }) exampleStore: TemplateRef<any>;

  ngOnInit(): void {
    this.settings = {
      title: 'FormFieldsetComponent',
      import: 'import { FormModule } from \'@pe/ng-kit/modules/form\';',
      sourcePath: 'form-components/form-fieldset/form-fieldset.component',
      examples: [
        {
          title: 'Default',
          tsExample: require('!!raw-loader!./examples/form-fieldset-default-example/form-fieldset-default-example.component.ts'),
          htmlExample: require('!!raw-loader!./examples/form-fieldset-default-example/form-fieldset-default-example.component.html'),
          content: this.exampleDefault
        },
        {
          title: 'Login',
          tsExample: require('!!raw-loader!./examples/form-fieldset-login-example/form-fieldset-login-example.component.ts'),
          htmlExample: require('!!raw-loader!./examples/form-fieldset-login-example/form-fieldset-login-example.component.html'),
          content: this.exampleLogin
        },
        {
          title: 'Hide disabled fields',
          tsExample: require('!!raw-loader!./examples/form-fieldset-hide-disabled-example/form-fieldset-hide-disabled-example.component.ts'),
          htmlExample: require('!!raw-loader!./examples/form-fieldset-hide-disabled-example/form-fieldset-hide-disabled-example.component.html'),
          content: this.exampleHideDisabled
        },
        {
          title: 'No border',
          tsExample: require('!!raw-loader!./examples/form-fieldset-no-border-example/form-fieldset-no-border-example.component.ts'),
          htmlExample: require('!!raw-loader!./examples/form-fieldset-no-border-example/form-fieldset-no-border-example.component.html'),
          content: this.exampleNoBorder
        },
        {
          title: 'Store form controls',
          tsExample: require('!!raw-loader!./examples/form-fieldset-store-example/form-fieldset-store-example.component.ts'),
          htmlExample: require('!!raw-loader!./examples/form-fieldset-store-example/form-fieldset-store-example.component.html'),
          content: this.exampleStore
        }
      ]
    };
  }
}
