import { NgModule } from '@angular/core';

import { I18nModule } from '../../i18n';
import { EnvironmentConfigModule } from '../../environment-config';
import { BackendLoggerModule } from '../../backend-logger';

import { GoogleAutocompleteDirective } from './directives';
import { AddressService, GoogleAutocompleteService } from './services';

@NgModule({
  declarations: [ GoogleAutocompleteDirective ],
  imports: [ I18nModule, EnvironmentConfigModule, BackendLoggerModule ],
  exports: [ GoogleAutocompleteDirective ],
  providers: [
    AddressService,
    GoogleAutocompleteService,
    {
      provide: 'Window',
      useValue: window,
    }
  ]
})
export class AddressModule {}
