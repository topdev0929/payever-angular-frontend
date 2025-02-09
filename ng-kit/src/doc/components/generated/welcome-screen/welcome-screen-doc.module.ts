import { NgModule } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';

import { WelcomeScreenDocComponent } from './welcome-screen-doc.component';
import { WelcomeScreenExampleDocComponent } from './examples';
import { DocComponentSharedModule } from '../doc-component-shared.module';
import { OverlayBoxModule } from '../../../../kit/overlay-box';

@NgModule({
  imports: [
    DocComponentSharedModule,
    OverlayBoxModule,
    MatCardModule,
    MatButtonModule
  ],
  declarations: [
    WelcomeScreenDocComponent,
    WelcomeScreenExampleDocComponent
  ]
})
export class WelcomeScreenDocModule {}
