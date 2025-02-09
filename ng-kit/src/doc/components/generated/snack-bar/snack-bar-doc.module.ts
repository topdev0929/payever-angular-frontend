import { NgModule } from '@angular/core';

import { IconsProviderModule } from '../../../../kit/icons-provider';
import { SnackBarModule } from '../../../../kit/snack-bar';

import { SnackBarDefaultExampleComponent } from './examples';
import { SnackBarDocComponent } from './snack-bar-doc.component';
import { DocComponentSharedModule } from '../doc-component-shared.module';

@NgModule({
  imports: [
    IconsProviderModule,
    DocComponentSharedModule,
    SnackBarModule
  ],
  declarations: [
    SnackBarDefaultExampleComponent,
    SnackBarDocComponent
  ]
})
export class SnackBarDocModule {
}
