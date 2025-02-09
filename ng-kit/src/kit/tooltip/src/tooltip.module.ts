import { NgModule } from '@angular/core';
import { MatTooltipModule } from '@angular/material/tooltip';
import { TooltipDirective } from './directives';

@NgModule({
  imports: [MatTooltipModule],
  declarations: [TooltipDirective],
  exports: [TooltipDirective]
})
export class TooltipModule {
}
