import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';


import { LoginStylesComponent } from './login-styles.component';


@NgModule({
  imports: [
    CommonModule,
  ],
  declarations: [
    LoginStylesComponent,
  ],
  exports: [
    LoginStylesComponent,
  ],
})
export class LoginStyleModule { }
