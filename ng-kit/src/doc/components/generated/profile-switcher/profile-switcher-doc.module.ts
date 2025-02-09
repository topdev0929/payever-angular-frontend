import { NgModule } from '@angular/core';
import { ProfileSwitcherModule } from '../../../../kit/profile-switcher/src/profile-switcher.module';
import { DocComponentSharedModule } from '../doc-component-shared.module';
import { AppSwitcherExampleDocComponent, ProfileSwitcherExampleDocComponent } from './examples';
import { ProfileSwitcherDocComponent } from './profile-switcher-doc.component';

@NgModule({
  imports: [
    DocComponentSharedModule,
    ProfileSwitcherModule
  ],
  declarations: [
    AppSwitcherExampleDocComponent,
    ProfileSwitcherDocComponent,
    ProfileSwitcherExampleDocComponent
  ],
  exports: [
    AppSwitcherExampleDocComponent,
    ProfileSwitcherDocComponent
  ]
})
export class ProfileSwitcherDocModule {
}
