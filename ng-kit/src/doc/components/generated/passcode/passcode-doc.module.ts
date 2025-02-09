import { NgModule } from '@angular/core';
import { PasscodeDocComponent } from './passcode-doc.component';
import { PasscodeServiceDocComponent } from './passcode-service-doc.component';
import { DocComponentSharedModule } from '../doc-component-shared.module';
import { PasscodeModule } from '../../../../kit/passcode/src';

@NgModule({
  imports: [
    DocComponentSharedModule,
    PasscodeModule
  ],
  declarations: [
    PasscodeDocComponent,
    PasscodeServiceDocComponent
  ]
})
export class PasscodeDocModule {
}
