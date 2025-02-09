import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PasscodeComponent } from './passcode.component';
import { PasscodeService } from './passcode.service';

@NgModule({
  imports: [
    CommonModule
  ],
  declarations: [
    PasscodeComponent
  ],
  providers: [ PasscodeService ],
  entryComponents: [ PasscodeComponent ],
  exports: [ PasscodeComponent ]
})
export class PasscodeModule {}
