import { NgModule } from '@angular/core';
import { HttpClientModule } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { DevHelpersComponent } from './dev-helpers.component';

@NgModule({
  imports: [
    CommonModule,
    HttpClientModule,
    FormsModule
  ],
  declarations: [
    DevHelpersComponent,
  ],
  exports: [
    DevHelpersComponent,
  ],
})

export class DevModule {}
