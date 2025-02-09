import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NotServerRenderDirective, OnlyServerRenderDirective } from './directives';

@NgModule({
  imports: [
    CommonModule
  ],
  declarations: [
    OnlyServerRenderDirective,
    NotServerRenderDirective
  ],
  exports: [
    OnlyServerRenderDirective,
    NotServerRenderDirective
  ]
})
export class ServerSideRenderingModule { }
