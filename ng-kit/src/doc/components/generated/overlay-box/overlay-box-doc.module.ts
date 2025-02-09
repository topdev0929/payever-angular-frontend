import { NgModule } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatExpansionModule } from '@angular/material/expansion';

import {
  OverlayBoxDocComponent,
  BlurDirectiveComponent,
  OverlayContainerExampleComponent,
  ContentCardExampleDocComponent,
  InfoBoxConfirmExampleDocComponent,
  InfoBoxExampleDocComponent,
  InfoBoxHeaderDocComponent,
  SubdashboardHeaderDocComponent,
  SubdashboardHeaderClientComponent,
} from './components';
import { DocComponentSharedModule } from '../doc-component-shared.module';
import { OverlayBoxModule } from '../../../../kit/overlay-box';
import { GridModule } from '../../../../kit/grid/src';

@NgModule({
  imports: [
    DocComponentSharedModule,
    OverlayBoxModule,
    MatCardModule,
    MatExpansionModule,
    MatButtonModule,
    MatCheckboxModule,
    MatButtonModule,
    GridModule
  ],
  declarations: [
    BlurDirectiveComponent,
    OverlayContainerExampleComponent,
    OverlayBoxDocComponent,
    ContentCardExampleDocComponent,
    InfoBoxConfirmExampleDocComponent,
    InfoBoxExampleDocComponent,
    InfoBoxHeaderDocComponent,
    SubdashboardHeaderDocComponent,
    SubdashboardHeaderClientComponent,
  ]
})
export class OverlayBoxDocModule {}
