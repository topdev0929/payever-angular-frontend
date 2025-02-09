import { CommonModule } from "@angular/common";
import { NgModule } from "@angular/core";
import { RouterModule, Routes } from "@angular/router";

import { I18nModule } from "@pe/i18n";
import { PebListInfoModule } from "@pe/ui";

import { PoliciesComponent } from "./policies.component";

const routes: Routes = [
  {
    path: ``,
    component: PoliciesComponent,
  },
];

const routerModule = RouterModule.forChild(routes);

@NgModule({
  imports: [
    CommonModule,
    PebListInfoModule,
    I18nModule,
    routerModule,
  ],
  providers: [],
  declarations: [PoliciesComponent],
})
export class PoliciesModule { }