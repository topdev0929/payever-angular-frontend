import { Component, ViewChild, TemplateRef } from '@angular/core';
import { DocContentSettingsInterface } from '../../../modules/example-viewer';
import { InfoBoxGeneratorComponent } from '../../../../kit/third-party-generator/src/components/info-box-generator/info-box-generator.component';

@Component({
  selector: 'third-party-generator-doc',
  templateUrl: 'third-party-generator-doc.component.html',
  styleUrls: ['third-party-generator-doc.component.scss']
})
export class ThirdPartyGeneratorDocComponent {

  settings: DocContentSettingsInterface;

  @ViewChild('exampleQrConfig', { static: true }) exampleConfigQr: TemplateRef<any>;
  @ViewChild('exampleQr', { static: true }) exampleQr: TemplateRef<any>;
  @ViewChild('exampleAmazon', { static: true }) exampleAmazon: TemplateRef<any>;
  @ViewChild('exampleDhl', { static: true }) exampleDhl: TemplateRef<any>;
  @ViewChild('exampleTwilio', { static: true }) exampleTwilio: TemplateRef<any>;
  @ViewChild('exampleStripe', { static: true }) exampleStripe: TemplateRef<any>;

  ngOnInit(): void {
    this.settings = {
      title: 'InfoBoxGeneratorComponent',
      import: 'import { ThirdPartyGeneratorModule } from \'@pe/ng-kit/modules/navbar\';',
      sourcePath: 'third-party-generator/src/components/info-box-generator/info-box-generator.component',
      examples: [
        {
          title: 'Qr Config',
          tsExample: require('!!raw-loader!./examples/third-party-generator-qr-config-example/third-party-generator-qr-config-example.component.ts'),
          htmlExample: require('!!raw-loader!./examples/third-party-generator-qr-config-example/third-party-generator-qr-config-example.component.html'),
          content: this.exampleConfigQr
        },
        {
          title: 'Qr',
          tsExample: require('!!raw-loader!./examples/third-party-generator-qr-example/third-party-generator-qr-example.component.ts'),
          htmlExample: require('!!raw-loader!./examples/third-party-generator-qr-example/third-party-generator-qr-example.component.html'),
          content: this.exampleQr
        },
        {
          title: 'Amazon',
          tsExample: require('!!raw-loader!./examples/third-party-generator-amazon-example/third-party-generator-amazon-example.component.ts'),
          htmlExample: require('!!raw-loader!./examples/third-party-generator-amazon-example/third-party-generator-amazon-example.component.html'),
          content: this.exampleAmazon
        },
        {
          title: 'DHL',
          tsExample: require('!!raw-loader!./examples/third-party-generator-dhl-example/third-party-generator-dhl-example.component.ts'),
          htmlExample: require('!!raw-loader!./examples/third-party-generator-dhl-example/third-party-generator-dhl-example.component.html'),
          content: this.exampleDhl
        },
        {
          title: 'Twilio',
          tsExample: require('!!raw-loader!./examples/third-party-generator-twilio-example/third-party-generator-twilio-example.component.ts'),
          htmlExample: require('!!raw-loader!./examples/third-party-generator-twilio-example/third-party-generator-twilio-example.component.html'),
          content: this.exampleTwilio
        },
        {
          title: 'Stripe',
          tsExample: require('!!raw-loader!./examples/third-party-generator-stripe-example/third-party-generator-stripe-example.component.ts'),
          htmlExample: require('!!raw-loader!./examples/third-party-generator-stripe-example/third-party-generator-stripe-example.component.html'),
          content: this.exampleStripe
        },
      ]
    };
  }
}
