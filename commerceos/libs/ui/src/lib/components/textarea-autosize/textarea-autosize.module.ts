import { TextFieldModule } from '@angular/cdk/text-field';
import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { PebTextareaAutosizeComponent } from './textarea-autosize.component';

@NgModule({
  declarations: [PebTextareaAutosizeComponent],
  imports: [CommonModule, FormsModule, ReactiveFormsModule, TextFieldModule],
  exports: [PebTextareaAutosizeComponent],
})
export class TextAreaAutosizeModule {}
