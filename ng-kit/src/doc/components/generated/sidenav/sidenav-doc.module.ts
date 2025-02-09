import { NgModule } from '@angular/core';
import { SidenavDocComponent } from './sidenav-doc.component';
import {
  DrawerDefaultExampleDocComponent,
  SidenavDefaultExampleDocComponent,
  SidenavTabsExampleDocComponent,
  SidenavSwitchExampleDocComponent
} from './examples';
import { DocComponentSharedModule } from '../doc-component-shared.module';
import { SidenavModule } from '../../../../kit/sidenav/src';
import { TreeModule } from '../../../../kit/tree/src';
import { TabsModule } from '../../../../kit/tabs/src';

import { MatButtonModule } from '@angular/material/button';
import { MatOptionModule } from '@angular/material/core';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatListModule } from '@angular/material/list';
import { MatMenuModule } from '@angular/material/menu';
import { MatSelectModule } from '@angular/material/select';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';

@NgModule({
  imports: [
    DocComponentSharedModule,
    SidenavModule,
    TreeModule,
    TabsModule,
    MatButtonModule,
    MatSlideToggleModule,
    MatMenuModule,
    MatFormFieldModule,
    MatOptionModule,
    MatSelectModule,
    MatInputModule,
    MatListModule,
  ],
  declarations: [
    SidenavDocComponent,
    DrawerDefaultExampleDocComponent,
    SidenavDefaultExampleDocComponent,
    SidenavTabsExampleDocComponent,
    SidenavSwitchExampleDocComponent
  ]
})
export class SidenavDocModule {}
