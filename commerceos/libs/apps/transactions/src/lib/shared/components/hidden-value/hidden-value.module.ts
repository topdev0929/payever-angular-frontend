import { CommonModule } from "@angular/common";
import { ComponentFactory, ComponentFactoryResolver, NgModule } from "@angular/core";

import { HiddenValueComponent } from "./hidden-value.component";

@NgModule({
  declarations: [
    HiddenValueComponent,
  ],
  imports: [
    CommonModule,
  ],
  exports: [
    HiddenValueComponent,
  ],
})
export class HiddenValueModule {
  constructor(protected componentFactoryResolver: ComponentFactoryResolver) {}

  resolveComponent(): ComponentFactory<HiddenValueComponent> {
    return this.componentFactoryResolver.resolveComponentFactory(HiddenValueComponent);
  }
}
