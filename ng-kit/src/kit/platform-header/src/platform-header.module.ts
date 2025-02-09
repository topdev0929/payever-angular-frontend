import { ModuleWithProviders, NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { CommonModule as PECommonModule } from '../../common';
import { NavbarModule } from '../../navbar';
import { PlatformHeaderComponent } from './components';
import { NotEmptyPlatformHeaderGuard } from './guards';
import { PlatformHeaderLoaderService, PlatformHeaderService } from './services';

@NgModule({
  imports: [
    CommonModule,
    PECommonModule.forRoot(),
    RouterModule,
    NavbarModule
  ],
  declarations: [
    PlatformHeaderComponent
  ],
  exports: [
    PlatformHeaderComponent
  ]
})
export class PlatformHeaderModule {

  static forRoot(): ModuleWithProviders<PlatformHeaderModule> {
    return {
      ngModule: PlatformHeaderModule,
      providers: [
        PlatformHeaderService,
        PlatformHeaderLoaderService,
        NotEmptyPlatformHeaderGuard
      ]
    };
  }

}
