import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';

import { I18nModule } from '@pe/i18n';
import { PeAbbreviationPipeModule } from '@pe/shared/pipes';

import { PeNavRoutingModule } from './nav-routing.module';
import { PeNavComponent } from './nav.component';


@NgModule({
  imports: [
    CommonModule,
    MatIconModule,

    I18nModule.forRoot(),
    PeAbbreviationPipeModule,

    PeNavRoutingModule,
  ],
  declarations: [
    PeNavComponent,
  ],
})
export class PeBuilderAppNavModule {
}
