import { Component, ViewChild, TemplateRef } from '@angular/core';
import { DocContentSettingsInterface } from '../../../modules/example-viewer';

@Component({
  selector: 'doc-i18n',
  templateUrl: 'i18n-doc.component.html'
})
export class I18nDocComponent {

  settings: DocContentSettingsInterface;

  @ViewChild('exampleLocalesSwitcher', { static: true }) exampleLocalesSwitcher: TemplateRef<any>;

  ngOnInit(): void {
    this.settings = {
      title: 'I18n module',
      import: 'import { I18nModule } from \'@pe/ng-kit/modules/i18n\';',
      examples: [
        {
          title: 'Locales switcher',
          tsExample: require('!!raw-loader!./examples/locales-switcher-example/locales-switcher-example.component.ts'),
          htmlExample: require('!!raw-loader!./examples/locales-switcher-example/locales-switcher-example.component.html'),
          content: this.exampleLocalesSwitcher
        }
      ]
    };
  }

}
