import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatListModule } from '@angular/material/list';
import { MatTreeModule } from '@angular/material/tree';
import { TreeComponent } from './components';

@NgModule({
  imports: [
    CommonModule,
    MatTreeModule,
    MatListModule,
    MatButtonModule
  ],
  declarations: [
    TreeComponent
  ],
  entryComponents: [
    TreeComponent
  ],
  exports: [
    TreeComponent
  ]
})
export class TreeModule {
}
