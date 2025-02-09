import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import {
  ColorsDocComponent,
  TypographyMatDocComponent,
  IconsDocComponent
} from './components/generated/base';
import {
  AlertsDocComponent,
  ButtonGroupsDocComponent,
  ButtonsDocComponent,
  DropdownsDocComponent,
  GridDocComponent,
  TablesDocComponent,
  TabsDocComponent
} from './components/generated/bootstrap';
import {
  FormsMatDocComponent,
  FormsAutocompleteMatDocComponent,
  FormsInputMatDocComponent,
  FormsCheckboxMatDocComponent,
  FormsSelectMatDocComponent,
  FormsTextareaMatDocComponent,
  FormsRadioMatDocComponent,
  FormsFieldsetMatDocComponent,

  CardMatDocComponent,
  MenuMatDocComponent,
  DialogMatDocComponent,
  ToolbarMatDocComponent,
  DividerMatDocComponent,
  GridListMatDocComponent,
  ButtonMatDocComponent,
  ButtonToggleMatDocComponent,
  BadgeMatDocComponent,
  ChipMatDocComponent,
  ExpansionPanelMatDocComponent,
  SpinnerMatDocComponent,
  TableMatDocComponent,
  TooltipDocComponent,
  SnackBarDocComponent,
  TabsMatDocComponent,
  SlideToggleDocComponent,
  MatListDocComponent,
  MatSliderDocComponent,
  MatSidenavDocComponents,
  TreeDocComponent
} from './components/generated/material';

import {
  AvatarDocComponent,
  BlockDocComponent,
  CardsDocComponent,
  ChartsDocComponent,
  HeaderDocComponent,
  LayoutDocComponent,
  LoaderDocComponent,
  PersonDocComponent,
  RateDocComponent,
  NumberFieldDocComponent
} from './components/generated/project';

const appRoutes: Routes = [
  {
    path: '',
    redirectTo: '/buttons',
    pathMatch: 'full'
  },

  // Base
  // --------------

  {
    path: 'colors',
    component: ColorsDocComponent
  },
  {
    path: 'typography',
    component: TypographyMatDocComponent
  },

  // Material
  // --------------

  //# Form Controls
  {
    path: 'mat-forms',
    component: FormsMatDocComponent
  },
  //# Autocomplete
  {
      path: 'mat-autocomplete',
      component: FormsAutocompleteMatDocComponent
  },
  {
    path: 'mat-input',
    component: FormsInputMatDocComponent
  },
  {
    path: 'mat-checkbox',
    component: FormsCheckboxMatDocComponent
  },
  {
    path: 'mat-select',
    component: FormsSelectMatDocComponent
  },
  {
    path: 'mat-textarea',
    component: FormsTextareaMatDocComponent
  },
  {
    path: 'mat-radio',
    component: FormsRadioMatDocComponent
  },
  {
    path: 'mat-fieldset',
    component: FormsFieldsetMatDocComponent
  },
  {
    path: 'mat-slider',
    component: MatSliderDocComponent
  },
  {
    path: 'mat-slide-toggle',
    component: SlideToggleDocComponent
  },

  //# Navigation
  {
    path: 'mat-menu',
    component: MenuMatDocComponent
  },
  {
    path: 'mat-sidenav',
    component: MatSidenavDocComponents
  },
  {
    path: 'mat-toolbar',
    component: ToolbarMatDocComponent
  },

  //# Layout
  {
    path: 'mat-card',
    component: CardMatDocComponent
  },
  {
    path: 'mat-divider',
    component: DividerMatDocComponent
  },
  {
    path: 'mat-grid-list',
    component: GridListMatDocComponent
  },
  //# List
  {
    path: 'mat-expansion-panel',
    component: ExpansionPanelMatDocComponent
  },
  {
    path: 'mat-list',
    component: MatListDocComponent
  },
  {
    path: 'mat-tabs',
    component: TabsMatDocComponent
  },
  {
    path: 'mat-tree',
    component: TreeDocComponent
  },

  //# Buttons & Indicators
  {
    path: 'mat-button',
    component: ButtonMatDocComponent
  },
  {
    path: 'mat-button-toggle',
    component: ButtonToggleMatDocComponent
  },
  {
    path: 'mat-badge',
    component: BadgeMatDocComponent
  },
  {
    path: 'mat-chip',
    component: ChipMatDocComponent
  },
  {
    path: 'mat-spinner',
    component: SpinnerMatDocComponent
  },

  //# Data Table
  {
    path: 'mat-table',
    component: TableMatDocComponent
  },

  //#  Popups & Modals
  {
    path: 'mat-dialog',
    component: DialogMatDocComponent
  },
  {
    path: 'mat-tooltip',
    component: TooltipDocComponent
  },
  {
    path: 'mat-snack-bar',
    component: SnackBarDocComponent
  },

  // Bootstrap
  // --------------

  {
    path: 'alerts',
    component: AlertsDocComponent
  },
  {
    path: 'button-groups',
    component: ButtonGroupsDocComponent
  },
  {
    path: 'buttons',
    component: ButtonsDocComponent
  },
  {
    path: 'dropdowns',
    component: DropdownsDocComponent
  },
  {
    path: 'grid',
    component: GridDocComponent
  },
  {
    path: 'tables',
    component: TablesDocComponent
  },
  {
    path: 'tabs',
    component: TabsDocComponent
  },

  // Project
  // --------------

  {
    path: 'avatar',
    component: AvatarDocComponent
  },
  {
    path: 'block',
    component: BlockDocComponent
  },
  {
    path: 'cards',
    component: CardsDocComponent
  },
  {
    path: 'charts',
    component: ChartsDocComponent
  },
  {
    path: 'header',
    component: HeaderDocComponent
  },
  {
    path: 'icons',
    component: IconsDocComponent
  },
  {
    path: 'layout',
    component: LayoutDocComponent
  },
  {
    path: 'loader',
    component: LoaderDocComponent
  },
  {
    path: 'number-field',
    component: NumberFieldDocComponent
  },
  {
    path: 'person',
    component: PersonDocComponent
  },
  {
    path: 'rate',
    component: RateDocComponent
  }
];

@NgModule({
  imports: [
    RouterModule.forRoot(appRoutes, {useHash: true})
  ],
  exports: [
    RouterModule
  ]
})

export class AppRoutingModule {}
