import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule, MatIconRegistry } from '@angular/material/icon';
import { MatTreeModule } from '@angular/material/tree';
import { DomSanitizer } from '@angular/platform-browser';

import { PebAutoHideScrollbarModule } from '@pe/builder/editor-utils';
import { PebEditorIconsModule } from '@pe/builder/old';
import { PebCreateShapeModule } from '@pe/builder/shapes';
import { I18nModule } from '@pe/i18n';
import { SnackbarModule } from '@pe/snackbar';

import { PebLayersComponent } from './layers.component';
import { LayerIcons } from './layor-icons';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MatIconModule,
    MatTreeModule,
    MatButtonModule,
    PebEditorIconsModule,
    PebAutoHideScrollbarModule,
    SnackbarModule,
    PebCreateShapeModule,
    I18nModule,
  ],
  declarations: [PebLayersComponent],
  exports: [PebLayersComponent],
})
export class PebLayersModule {
  constructor(iconRegistry: MatIconRegistry, domSanitizer: DomSanitizer) {
    LayerIcons.forEach((icon) => {
      iconRegistry.addSvgIcon(icon.key, domSanitizer.bypassSecurityTrustResourceUrl(`${icon.url}`));
    });
  }
}
