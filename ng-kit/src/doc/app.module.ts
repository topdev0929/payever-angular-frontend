import { HttpClientModule } from '@angular/common/http';
import { CUSTOM_ELEMENTS_SCHEMA, NgModule } from '@angular/core';
import { BrowserModule, HammerModule } from '@angular/platform-browser';
import { OverlayBoxModule } from '../kit/overlay-box/src';
import { DocSharedModule } from './modules/shared.module';
import { DocModalsModule } from './components/generated/modals/modals.module';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import * as modules from '../kit';
import { ComponentsModule } from './components/components.module';
import { GuidesModule } from './guides/guides.module';
import { TabsModule } from 'ngx-bootstrap/tabs';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { BsDropdownModule } from 'ngx-bootstrap/dropdown';
import { ModalModule as NgxModalModule } from 'ngx-bootstrap/modal';
import { MediaModule } from '../kit/media';

@NgModule({
  imports: [
    BrowserModule,
    HttpClientModule,
    AppRoutingModule,
    DocSharedModule,
    DocModalsModule,
    // Kit modules
    modules.EnvironmentConfigModule.forRoot(),
    modules.IconsProviderModule,
    ComponentsModule,
    GuidesModule,
    BrowserAnimationsModule,
    BsDropdownModule.forRoot(),
    NgxModalModule.forRoot(),
    TabsModule.forRoot(),
    MediaModule.forRoot({
      maxImageSize: 5242880,
      maxImageSizeText: '5MB'
    }),
    OverlayBoxModule.forRoot(),
    HammerModule
  ],
  declarations: [
    AppComponent,
  ],
  bootstrap: [AppComponent],
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class AppModule {
}
