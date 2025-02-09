import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatMenuModule } from '@angular/material/menu';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { CommonModule as KitCommonModule } from '../../common/src';
import { PeAppSwitcherComponent, PeProfileCardComponent, PeSwitcherBusinessListComponent, PeSwitcherProfileListComponent, ProfileSpinnerComponent } from './components';
import { BrowserModule } from '../../browser/src';

@NgModule({
  imports: [
    CommonModule,
    KitCommonModule,
    MatButtonModule,
    MatCardModule,
    MatMenuModule,
    MatProgressSpinnerModule,
    BrowserModule
  ],
  declarations: [
    PeAppSwitcherComponent,
    PeSwitcherProfileListComponent,
    PeProfileCardComponent,
    PeSwitcherBusinessListComponent,
    ProfileSpinnerComponent
  ],
  exports: [
    PeAppSwitcherComponent,
    PeSwitcherProfileListComponent,
    PeProfileCardComponent,
    PeSwitcherBusinessListComponent
  ]
})
export class ProfileSwitcherModule {}
