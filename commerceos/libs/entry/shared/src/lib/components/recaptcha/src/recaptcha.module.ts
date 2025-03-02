import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';

import { PE_ENV } from '@pe/common';
import { I18nModule } from '@pe/i18n';

import { ReCaptchaComponent } from './components';
import { ReCaptchaService } from './services';

@NgModule({
  declarations: [ ReCaptchaComponent ],
  imports: [ CommonModule, I18nModule ],
  exports: [ ReCaptchaComponent ],
  providers: [
    ReCaptchaService,
    {
      provide: 'Window',
      useValue: window,
    },
    {
      provide: 'RECAPTCH_KEY',
      deps: [PE_ENV],
      useFactory: env => env.config.recaptchaSiteKey,
    },
  ],
})
export class ReCaptchaModule {}
