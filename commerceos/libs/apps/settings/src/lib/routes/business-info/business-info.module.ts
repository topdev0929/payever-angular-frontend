import { CommonModule } from "@angular/common";
import { NgModule } from "@angular/core";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { RouterModule, Routes } from "@angular/router";

import { I18nModule } from "@pe/i18n";
import { PebButtonModule, PebFormBackgroundModule, PebFormFieldInputModule } from "@pe/ui";

import { ImagesUploaderService } from "../../services/images-uploader.service";

import { BusinessInfoComponent } from "./business-info.component";

const routes: Routes = [
  {
    path: ``,
    component: BusinessInfoComponent,
  },
];

const routerModule = RouterModule.forChild(routes);

@NgModule({
  imports: [
    CommonModule,
    I18nModule,
    FormsModule,
    ReactiveFormsModule,
    PebButtonModule,
    PebFormBackgroundModule,
    PebFormFieldInputModule,
    routerModule,
  ],
  providers: [ImagesUploaderService],
  declarations: [BusinessInfoComponent],
})
export class BusinessInfoModule { }