import { CommonModule } from '@angular/common';
import { ModuleWithProviders, NgModule } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatCardModule } from '@angular/material/card';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatListModule } from '@angular/material/list';
import { MatMenuModule } from '@angular/material/menu';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

import { NavbarModule } from '../../navbar';
import { ButtonModule } from '../../button';
import {
  ContentCardComponent,
  GroupViewsBoxComponent,
  InfoBoxComponent,
  InfoBoxConfirmComponent,
  InfoBoxHeaderComponent,
  LoadingBoxComponent,
  OverlayContainerComponent,
  SubdashboardHeaderComponent,
  WelcomeScreenComponent,
} from './components';
import { BrowserModule } from '../../browser';
import { BlurDirective } from './directives';
import { InfoBoxService } from './services';
import { I18nModule } from '../../i18n';
import { CommonModule as NgKitCommonModule } from '../../common';

const shared: any[] = [
  ContentCardComponent,
  GroupViewsBoxComponent,
  InfoBoxComponent,
  InfoBoxConfirmComponent,
  InfoBoxHeaderComponent,
  LoadingBoxComponent,
  OverlayContainerComponent,
  SubdashboardHeaderComponent,
  WelcomeScreenComponent,
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
    MatButtonToggleModule,
    MatExpansionModule,
    MatMenuModule,
    NgKitCommonModule,
    BrowserModule
  ],
  exports: [
    BlurDirective,
    ...shared,
  ],
  declarations: [
    BlurDirective,
    ...shared
  ]
})
export class OverlayBoxModule {

  /**
   * @deprecated remove this usage. And check that you dont use InfoBoxService in your project
   */
  static forRoot(): ModuleWithProviders<OverlayBoxModule> {
    return {
      ngModule: OverlayBoxModule,
      providers: [
        InfoBoxService,
      ]
    };
  }
}
