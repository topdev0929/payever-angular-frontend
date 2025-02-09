import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { ApolloModule } from 'apollo-angular';

import { ContactsGQLService } from '@pe/apps/contacts';
import { I18nModule } from '@pe/i18n';
import { PeOverlayWidgetService } from '@pe/overlay-widget';
import { PebExpandablePanelModule, PePickerModule } from '@pe/ui';

import { PeBuilderShareApi } from './builder-share.api';
import { PeBuilderShareComponent } from './builder-share.component';
import { PeBuilderShareService } from './builder-share.service';
import { PeBuilderShareGetLinkComponent } from './get-link/get-link.component';
import { PeBuilderShareStylesComponent } from './styles/builder-share.styles';

@NgModule({
  imports: [
    CommonModule,
    ReactiveFormsModule,
    PebExpandablePanelModule,
    PePickerModule,
    ApolloModule,
    MatMenuModule,
    MatIconModule,
    I18nModule,
  ],
  declarations: [
    PeBuilderShareComponent,
    PeBuilderShareStylesComponent,
    PeBuilderShareGetLinkComponent,
  ],
  exports: [
    PeBuilderShareComponent,
  ],
  providers: [
    PeBuilderShareService,
    PeOverlayWidgetService,
    ContactsGQLService,
    PeBuilderShareApi,
  ],
})
export class PeBuilderShareModule {}
