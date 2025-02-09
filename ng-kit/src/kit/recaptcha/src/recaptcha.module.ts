import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { I18nModule } from '../../i18n';
import { EnvironmentConfigModule } from '../../environment-config';

import { ReCaptchaComponent } from './components';
import { ReCaptchaService } from './services';

@NgModule({
  declarations: [ ReCaptchaComponent ],
  imports: [ CommonModule, I18nModule, EnvironmentConfigModule ],
  exports: [ ReCaptchaComponent ],
  providers: [
    ReCaptchaService,
    {
      provide: 'Window',
      useValue: window,
    }
  ]
})
export class ReCaptchaModule {}
