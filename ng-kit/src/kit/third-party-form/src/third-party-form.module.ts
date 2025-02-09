import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatListModule } from '@angular/material/list';
import { MatMenuModule } from '@angular/material/menu';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';

import { BrowserModule } from '../../browser';
import { ButtonModule } from '../../button';
import { CommonModule as NgKitCommonModule } from '../../common';
import { FormModule as NgFormModule } from '../../form';
import { I18nModule } from '../../i18n';
import { NavbarModule } from '../../navbar';
import { OverlayBoxModule as NgOverlayBoxModule } from '../../overlay-box';
import { ThirdPartyFormComponent, ThirdPartyRootFormComponent } from './components';

const shared: any[] = [
  ThirdPartyFormComponent,
  ThirdPartyRootFormComponent
];

@NgModule({
  imports: [
    CommonModule,
    I18nModule.forChild(),
    MatButtonModule,
    MatCardModule,
    MatProgressSpinnerModule,
    MatListModule,
    NavbarModule,
    ButtonModule,
    MatExpansionModule,
    MatMenuModule,
    MatSlideToggleModule,
    NgKitCommonModule,
    NgFormModule,
    NgOverlayBoxModule,
    BrowserModule
  ],
  exports: [
    ...shared,
  ],
  declarations: [
    ...shared
  ]
})
export class ThirdPartyFormModule {
}
