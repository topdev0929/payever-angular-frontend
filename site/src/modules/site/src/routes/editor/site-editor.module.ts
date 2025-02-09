import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { MatChipsModule } from '@angular/material/chips';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatFormFieldModule } from '@angular/material/form-field';

import { PebShopEditorModule } from '@pe/builder-shop-editor';
import { I18nModule } from '@pe/i18n';

import { PebSiteEditorComponent } from './site-editor.component';
import { PebSiteBuilderViewComponent } from '../../components/builder-view/builder-view.component';


export const routerModule = RouterModule.forChild([
  {
    path: '',
    component: PebSiteEditorComponent,
  },
]);

@NgModule({
  imports: [
    CommonModule,
    PebShopEditorModule,
    routerModule,
    I18nModule,
    MatChipsModule,
    MatProgressSpinnerModule,
    MatFormFieldModule,
  ],
  declarations: [
    PebSiteEditorComponent,
    PebSiteBuilderViewComponent,
  ],
})
export class PebSiteEditorRouteModule {}
