import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { PebSeoFormModule } from '@pe/builder/forms';
import { PebEditorIconsModule } from '@pe/builder/old';

import { PebEditorShopSeoSidebarComponent } from './seo.sidebar';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    PebEditorIconsModule,
    PebSeoFormModule,
  ],
  declarations: [
    PebEditorShopSeoSidebarComponent,
  ],
  exports: [
    PebEditorShopSeoSidebarComponent,
  ],
})
export class PebEditorShopSeoPluginModule {
}
