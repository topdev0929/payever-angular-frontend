import { CommonModule } from "@angular/common";
import { NgModule } from "@angular/core";
import { RouterModule, Routes } from "@angular/router";

import { I18nModule } from "@pe/i18n";
import { PebButtonModule, PebListInfoModule } from "@pe/ui";

import { BillingComponent } from "./billing.component";

const routes: Routes = [
  {
    path: ``,
    component: BillingComponent,
  },
];

const routerModule = RouterModule.forChild(routes);

@NgModule({
  imports: [CommonModule, I18nModule, PebListInfoModule, PebButtonModule, routerModule],
  declarations: [BillingComponent],
})
export class BillingModule { }
