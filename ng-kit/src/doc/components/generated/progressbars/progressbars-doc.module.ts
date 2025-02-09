import { NgModule } from '@angular/core';
import { ProgressbarsDocComponent } from './progressbars-doc.component';
import { DocComponentSharedModule } from '../doc-component-shared.module';
import { ProgressbarModule } from 'ngx-bootstrap/progressbar';

@NgModule({
  imports: [
    DocComponentSharedModule,
    ProgressbarModule
  ],
  declarations: [ProgressbarsDocComponent]
})
export class ProgressbarsDocModule {
}
