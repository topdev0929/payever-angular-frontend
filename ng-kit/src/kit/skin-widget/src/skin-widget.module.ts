import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { ProgressbarModule } from 'ngx-bootstrap/progressbar';
import { TabsModule } from 'ngx-bootstrap/tabs';

import { SkinWidgetComponent, SkinWidgetItemComponent, SkinWidgetUploadComponent } from './components';
import { SkinWidgetService } from './skin-widget.service';

@NgModule({
  imports: [
    CommonModule,
    TabsModule,
    ProgressbarModule
  ],
  declarations: [
    SkinWidgetComponent,
    SkinWidgetItemComponent,
    SkinWidgetUploadComponent
  ],
  exports: [
    SkinWidgetComponent
  ],
  providers: [
    SkinWidgetService
  ]
})
export class SkinWidgetModule {}
