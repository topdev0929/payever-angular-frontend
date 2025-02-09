import { NgModule } from '@angular/core';
import { ProfileServiceDocComponent } from './profile-service-doc.component';
import { DocComponentSharedModule } from '../doc-component-shared.module';
import { ProfileModule } from '../../../../kit/profile';

@NgModule({
  imports: [
    DocComponentSharedModule,
    ProfileModule
  ],
  declarations: [ProfileServiceDocComponent]
})
export class ProfileServiceDocModule {
}
