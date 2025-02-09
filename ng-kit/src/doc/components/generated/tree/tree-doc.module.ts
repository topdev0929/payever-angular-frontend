import { NgModule } from '@angular/core';
import { TreeDocComponent } from './tree-doc.component';
import { TreeDefaultExampleDocComponent } from './examples';
import { DocComponentSharedModule } from '../doc-component-shared.module';
import { TreeModule } from '../../../../kit/tree/src';
import { MatButtonModule } from '@angular/material/button';

@NgModule({
  imports: [
    DocComponentSharedModule,
    TreeModule,
    MatButtonModule
  ],
  declarations: [
    TreeDocComponent,
    TreeDefaultExampleDocComponent,
  ]
})
export class TreeDocModule {}
