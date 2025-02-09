import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { RouterModule, Routes } from '@angular/router';

import { I18nModule } from '@pe/i18n';
import { PebButtonToggleModule, PebCheckboxModule, PebFormBackgroundModule, PebListInfoModule, PebRadioModule } from '@pe/ui';

import { AppearanceComponent } from './appearance.component';

const routes: Routes = [
  {
    path: ``,
    component: AppearanceComponent,
  },
];

const routerModule = RouterModule.forChild(routes);

@NgModule({
  declarations: [
    AppearanceComponent,
  ],
    imports: [
        routerModule,
        I18nModule,
        FormsModule,
        ReactiveFormsModule,
        MatProgressSpinnerModule,
        CommonModule,
        PebRadioModule,
        PebCheckboxModule,
        PebButtonToggleModule,
        PebFormBackgroundModule,
        PebListInfoModule,
    ],
  providers: [
  ],
})
export class AppearanceModule { }
