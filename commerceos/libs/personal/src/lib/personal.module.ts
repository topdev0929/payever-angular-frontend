import { CommonModule } from '@angular/common';
import { InjectionToken, NgModule } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatSelectModule } from '@angular/material/select';

import { BaseDashboardModule } from '@pe/base-dashboard';
import { PE_ENV, PE_MEDIA_API_PATH } from '@pe/common';
import { DockerModule, DockerService } from '@pe/docker';
import { PeHeaderModule, PlatformHeaderService } from '@pe/header';
import { I18nModule } from '@pe/i18n';
import { PePlatformHeaderModule, PePlatformHeaderService } from '@pe/platform-header';
import { PE_PRODUCTS_API_PATH } from '@pe/shared/products';
import { NgxZendeskWebwidgetModule, ZendeskConfig, ZendeskGuard } from '@pe/zendesk';

import { PersonalDashboardLayoutComponent, PersonalLayoutComponent } from './components';
import { PersonalAppRegistryGuard } from './guards';
import { PEPersonalRoutingModule } from './personal-routing.module';

export const PEB_PRODUCTS_API_PATH = new InjectionToken<string>('PEB_PRODUCTS_API_PATH');

@NgModule({
  imports: [
    CommonModule,
    MatButtonModule,
    MatExpansionModule,
    MatSelectModule,
    I18nModule.forChild(),
    PEPersonalRoutingModule,
    NgxZendeskWebwidgetModule.forRoot(ZendeskConfig),
    BaseDashboardModule,
    DockerModule,
    PeHeaderModule,
    PePlatformHeaderModule,
  ],
  declarations: [PersonalLayoutComponent, PersonalDashboardLayoutComponent],
  providers: [
    PersonalAppRegistryGuard,
    ZendeskGuard,
    DockerService,
    {
      provide: PE_MEDIA_API_PATH,
      deps: [PE_ENV],
      useFactory: (env: any) => env.backend.media,
    },
    {
      provide: PE_PRODUCTS_API_PATH,
      useExisting: PEB_PRODUCTS_API_PATH,
    },
    {
      provide: PEB_PRODUCTS_API_PATH,
      deps: [PE_ENV],
      useFactory: env => env.backend.products,
    },
    {
      provide: PePlatformHeaderService,
      useClass: PlatformHeaderService,
    },
  ],
})
export class PEPersonalModule {}
