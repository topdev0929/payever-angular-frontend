import { NgModule, ModuleWithProviders } from '@angular/core';
import { CommonModule } from '@angular/common';

import { CategoryService, ConfigService, ProductsService } from './services';

@NgModule({
  imports: [
    CommonModule
  ],
  declarations: [],
  entryComponents: [],
  exports: [],
  providers: [
    CategoryService,
    ProductsService,
  ]
})
export class ProductsModule {
  static forRoot(): ModuleWithProviders<CommonModule> {
    return {
      ngModule: CommonModule,
      providers: [
        ConfigService,
      ]
    };
  }
}
