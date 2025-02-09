import { NgModule, } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';

import { NavbarDocComponent } from './navbar-doc.component';
import {
  NavbarDefaultExampleComponent, NavbarTransparentExampleComponent, NavbarMicroExampleComponent, PlatformHeaderExampleComponent
} from './examples';
import { DocComponentSharedModule } from '../doc-component-shared.module';
import { NavbarModule } from '../../../../kit/navbar/src';
import { PlatformHeaderModule } from '../../../../kit/platform-header/src';

@NgModule({
  imports: [
    DocComponentSharedModule,
    NavbarModule,
    PlatformHeaderModule,
    PlatformHeaderModule.forRoot(),
    MatButtonModule
  ],
  declarations: [
    NavbarDocComponent,
    NavbarDefaultExampleComponent,
    NavbarTransparentExampleComponent,
    NavbarMicroExampleComponent,
    PlatformHeaderExampleComponent
  ]
})
export class NavbarDocModule {
}
