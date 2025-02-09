import { CommonModule } from "@angular/common";
import { NgModule } from "@angular/core";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { RouterModule, Routes } from "@angular/router";

import { I18nModule } from "@pe/i18n";
import { PebButtonToggleModule, PebFormBackgroundModule,
  PebFormFieldInputModule, 
  PebFormFieldTextareaModule, 
  PebListInfoModule, 
  PebSelectModule, 
  PeInputPickerModule,
 } from "@pe/ui";

import { LogoAndStatusPickerModule } from "../../components/logo-and-status-picker";
import { ImagesUploaderService } from "../../services";

import { 
  EditLanguageComponent, 
  EditOwnerComponent, 
  EditPasswordComponent,
  EditPersonalInfoComponent, 
} from "./components";
import { GeneralComponent } from "./general.component";


const routes: Routes = [
  {
    path: ``,
    children: [
      {
        path: ``,
        component: GeneralComponent,
      },
      {
        path: `:modal`,
        component: GeneralComponent,
      },
    ],
  },

];

const routerModule = RouterModule.forChild(routes);

@NgModule({
  imports: [
    FormsModule,
    CommonModule,
    ReactiveFormsModule,
    PebListInfoModule,
    I18nModule,
    routerModule,
    PebFormBackgroundModule,
    PebButtonToggleModule,
    PebSelectModule,
    PeInputPickerModule,
    PebFormFieldTextareaModule,
    PebFormFieldInputModule,
    LogoAndStatusPickerModule,
  ],
  providers: [
    ImagesUploaderService,
  ],
  declarations: [
    GeneralComponent,
    EditLanguageComponent,
    EditOwnerComponent,
    EditPasswordComponent,
    EditPersonalInfoComponent,
  ],

})
export class GeneralModule { }
