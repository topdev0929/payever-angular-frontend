import { NgModule, ModuleWithProviders } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ThemeSwitcherComponent } from './theme-switcher.component';
import { ThemeSwitcherService } from './theme-switcher.service';


const themeSwitcherFactory = () => {
  if (!window['pe_ThemeSwitcherService']) {
    window['pe_ThemeSwitcherService'] = new ThemeSwitcherService();
  }
  return window['pe_ThemeSwitcherService'];
}
@NgModule({
  imports: [
    CommonModule
  ],
  declarations: [
    ThemeSwitcherComponent
  ],
  entryComponents: [ ThemeSwitcherComponent ],
  exports: [ ThemeSwitcherComponent ],
  providers: [
    {
      provide: ThemeSwitcherService, useFactory: themeSwitcherFactory
    }
  ]
})

export class ThemeSwitcherModule {

    /**
   * @deprecated
   */
  static forRoot(): ModuleWithProviders<ThemeSwitcherModule> {
    return {
      ngModule: ThemeSwitcherModule,
      providers: [
        {
          provide: ThemeSwitcherService, useFactory: themeSwitcherFactory
        }
      ]
    };
  }
}

