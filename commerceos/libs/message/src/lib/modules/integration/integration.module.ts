import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatSliderModule } from '@angular/material/slider';
import { MatTabsModule } from '@angular/material/tabs';
import { RouterModule, Routes } from '@angular/router';
import { SWIPER_CONFIG, SwiperConfigInterface, SwiperModule } from 'ngx-swiper-wrapper';

import { PebColorPickerModule } from '@pe/builder-color-picker';
import { I18nModule } from '@pe/i18n';
import { ChannelFacadeClass } from '@pe/message/shared';
import {
  PebButtonToggleModule,
  PebColorPickerFormModule, PebExpandablePanelModule,
  PebFormFieldInputModule,
  PebSelectModule,
  PePickerModule,
  PebFormBackgroundModule,
} from '@pe/ui';

import { PeMessageModule } from '../message';
import { PeSharedModule } from '../shared';

import { PeMessageAppearanceComponent } from './message-appearance';
import { MessageAppearanceBlurComponent } from "./message-appearance-blur";
import { PeMessageAppearanceColorComponent } from './message-appearance-color';
import { PeMessageAppearanceColorMockupComponent } from './message-appearance-color-mockup';
import { MessageAppearancePreviewComponent } from './message-appearance-preview';
import { MessageAppearanceShadowComponent } from './message-appearance-shadow';
import { MessageBubbleSettingsComponent } from './message-bubble-settings';
import { PeMessageEmbedComponent } from './message-embed';
import { PeMessageIntegrationRootComponent } from './message-integration-root';
import { PeMessageSliderComponent } from './message-slider';
import { MessageThemeSettingsComponent } from './message-theme-settings';

const DEFAULT_SWIPER_CONFIG: SwiperConfigInterface = {
  direction: 'horizontal',
  slidesPerView: 'auto',
  navigation: false,
  pagination: false,
};

export const routes: Routes = [
  {
    path: '',
    component: PeMessageIntegrationRootComponent,
  },
];
export const I18nModuleForRoot = I18nModule.forRoot();
export const PeContactsRouterModuleForChild = RouterModule.forChild(routes);


@NgModule({
  imports: [
    CommonModule,
    I18nModuleForRoot,

    FormsModule,
    ReactiveFormsModule,

    MatTabsModule,
    MatSliderModule,

    PePickerModule,
    PebFormBackgroundModule,
    PebColorPickerModule,
    PebColorPickerFormModule,
    PebFormFieldInputModule,
    PebSelectModule,
    PebButtonToggleModule,
    PebExpandablePanelModule,

    PeSharedModule,
    SwiperModule,
    PeContactsRouterModuleForChild,

    PeMessageModule,
  ],
  declarations: [
    PeMessageIntegrationRootComponent,
    PeMessageAppearanceComponent,
    PeMessageAppearanceColorComponent,
    PeMessageAppearanceColorMockupComponent,
    MessageAppearancePreviewComponent,
    MessageAppearanceShadowComponent,
    MessageBubbleSettingsComponent,
    MessageThemeSettingsComponent,
    PeMessageEmbedComponent,
    PeMessageSliderComponent,
    MessageAppearanceBlurComponent,
  ],
  exports: [],
  providers: [
    ChannelFacadeClass,
    {
      provide: SWIPER_CONFIG,
      useValue: DEFAULT_SWIPER_CONFIG,
    },
  ],
})
export class PeIntegrationModule {}
