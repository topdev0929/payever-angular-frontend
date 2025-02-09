import { NgModule } from '@angular/core';
import { ExampleTemplateComponent } from './example-template.component';
import { TabsModule } from 'ngx-bootstrap/tabs';
import { DocSharedModule } from '../../modules/shared.module';

@NgModule({
  imports: [DocSharedModule, TabsModule],
  exports: [ExampleTemplateComponent],
  declarations: [ExampleTemplateComponent]
})
export class ExampleTemplateModule {

}
