import { NgModule } from '@angular/core';
import { ProfileContainerDocComponent } from './profile-container-doc.component';
import { DocComponentSharedModule } from '../doc-component-shared.module';
import { ProfileContainerModule } from '../../../../kit/profile-container/src';

@NgModule({
  imports: [
    DocComponentSharedModule,
    ProfileContainerModule
  ],
  declarations: [ProfileContainerDocComponent]
})
export class ProfileContainerDocModule {
}
