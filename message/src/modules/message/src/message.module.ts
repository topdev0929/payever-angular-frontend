import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { DragDropModule } from '@angular/cdk/drag-drop';
import { HTTP_INTERCEPTORS } from '@angular/common/http';
import { OverlayModule } from '@angular/cdk/overlay';
import { MatMenuModule } from '@angular/material/menu';
import { MatTabsModule } from '@angular/material/tabs';
import { MatSliderModule } from '@angular/material/slider';
import { MatDialogModule } from '@angular/material/dialog';
import { ClipboardModule } from '@angular/cdk/clipboard';

import { SwiperModule, SWIPER_CONFIG, SwiperConfigInterface } from 'ngx-swiper-wrapper';

import { PebColorPickerModule } from '@pe/builder-color-picker';
import { PeChatModule, PeChatService } from '@pe/chat';
import { I18nModule } from '@pe/i18n';
import { OverlayWidgetModule, PeOverlayWidgetService, PE_OVERLAY_DATA } from '@pe/overlay-widget';
import { PeSidebarModule } from '@pe/sidebar';
import { PebConfirmActionDialogModule } from '@pe/confirm-action-dialog';
import {
  PebButtonModule, PebButtonToggleModule, PebExpandablePanelModule, PebFormBackgroundModule,
  PebFormFieldInputModule, PebSelectModule, PeContextMenuService, PebLogoPickerModule, PePickerModule, PebContextMenuModule,
  PebColorPickerFormModule,
} from '@pe/ui';
import { PeDataGridModule } from '@pe/data-grid';
import { MediaModule, MediaUrlPipe } from '@pe/media';

import { PeMessageAuthInterceptor } from './interceptors';
import { PeMessageComponent } from './message.component';
import { PeMessageBusinessResolver } from './resolvers';
import { PeMessageRouteModule } from './message.routing';
import {
  PeMessageAppearanceColorComponent,
  PeMessageAppearanceColorMockupComponent,
  PeMessageAppearanceComponent,
  PeMessageChannelFormComponent,
  PeMessageChatRoomComponent,
  PeMessageChatRoomFormComponent,
  PeMessageChatRoomListComponent,
  PeMessageChatRoomSettingsComponent,
  PeMessageFolderFormComponent,
  PeMessageFolderTreeComponent,
  PeMessageLoaderComponent,
  PeMessageNavComponent,
  PeMessageProductListComponent,
  PeMessageSubscriptionListComponent,
  PeMessageBubbleLiveChatComponent,
  PeMessageEmbedComponent,
  PeMessageAddAdminsComponent,
  PeMessageEditInfoComponent,
  PeMessageInviteLinkComponent,
  MessageBubbleSettingsComponent,
  MessageThemeSettingsComponent,
  MessageBubbleItemComponent,
  MessageAppearancePreviewComponent,
  MessageAppearanceShadowComponent,
  PeMessageSliderComponent,
  PeMessageAdditionalChannelSettingsComponent,
  PeMessagePermissionsComponent,
  PeMessageConnectRootComponent,
  PeMessageIntegrationRootComponent,
  PeMessageChannelRootComponent,
} from './components';
import {
  PeMessageApiService,
  PeMessageChatRoomListService,
  PeMessageChatRoomService,
  PeMessageEnvService,
  PeMessageNavService,
  PeMessageService,
  PeMessageThemeService,
  PeMessageChatBoxService,
  PeMessageGuardService,
} from './services';

import { PeMessageAppearanceShadowDirective, PeMessageSliderDirective } from './directives';
import { AdminGuard } from './guards/admin.guard';
import { RolesGuard } from './guards/roles.guard';

const DEFAULT_SWIPER_CONFIG: SwiperConfigInterface = {
  direction: 'horizontal',
  slidesPerView: 'auto',
  navigation: false,
  pagination: false,
};

(window as any)?.PayeverStatic?.SvgIconsLoader?.loadIcons([
  'social-facebook-12',
  'social-instagram-12',
  'social-live-chat-12',
  'social-telegram-18',
  'social-whatsapp-12',
  'file-14',
]);

export const I18nModuleForRoot = I18nModule.forRoot();

@NgModule({
  imports: [
    ClipboardModule,
    CommonModule,
    DragDropModule,
    FormsModule,
    MatMenuModule,
    MatTabsModule,
    MatSliderModule,
    ReactiveFormsModule,

    SwiperModule,

    I18nModuleForRoot,
    MediaModule,
    OverlayModule,
    OverlayWidgetModule,
    PebColorPickerModule,
    PebContextMenuModule,
    PebButtonModule,
    PebExpandablePanelModule,
    PebFormBackgroundModule,
    PebFormFieldInputModule,
    PebButtonToggleModule,
    PebLogoPickerModule,
    PeChatModule,
    PeDataGridModule,
    PePickerModule,
    PeSidebarModule,
    PebButtonToggleModule,
    PebSelectModule,
    PebColorPickerFormModule,
    MatDialogModule,
    PebConfirmActionDialogModule,

    PeMessageRouteModule,
  ],
  declarations: [
    PeMessageAppearanceComponent,
    PeMessageAppearanceColorComponent,
    PeMessageAppearanceColorMockupComponent,
    PeMessageComponent,
    PeMessageChatRoomComponent,
    PeMessageChatRoomFormComponent,
    PeMessageChatRoomListComponent,
    PeMessageChatRoomSettingsComponent,
    PeMessageChannelFormComponent,
    PeMessageEmbedComponent,
    PeMessageProductListComponent,
    PeMessageFolderFormComponent,
    PeMessageFolderTreeComponent,
    PeMessageLoaderComponent,
    PeMessageNavComponent,
    PeMessageSubscriptionListComponent,
    PeMessageBubbleLiveChatComponent,
    MessageBubbleSettingsComponent,
    MessageThemeSettingsComponent,
    MessageBubbleItemComponent,
    MessageAppearancePreviewComponent,
    MessageAppearanceShadowComponent,
    PeMessageSliderComponent,

    PeMessageAppearanceShadowDirective,
    PeMessageSliderDirective,
    PeMessageAddAdminsComponent,
    PeMessageInviteLinkComponent,
    PeMessageAdditionalChannelSettingsComponent,
    PeMessageEditInfoComponent,
    PeMessagePermissionsComponent,
    PeMessageIntegrationRootComponent,
    PeMessageConnectRootComponent,
    PeMessageChannelRootComponent,
  ],
  providers: [
    PeMessageBusinessResolver,

    PeMessageApiService,
    PeMessageChatRoomService,
    PeMessageChatRoomListService,
    PeMessageEnvService,
    PeMessageNavService,
    PeMessageService,
    PeMessageThemeService,
    PeMessageChatBoxService,
    PeMessageGuardService,

    AdminGuard,
    RolesGuard,

    MediaUrlPipe,
    PeChatService,
    PeContextMenuService,
    PeOverlayWidgetService,
    {
      provide: PE_OVERLAY_DATA,
      useValue: {},
    },
    {
      provide: HTTP_INTERCEPTORS,
      useClass: PeMessageAuthInterceptor,
      multi: true,
    },
    {
      provide: SWIPER_CONFIG,
      useValue: DEFAULT_SWIPER_CONFIG,
    },
  ],
  exports: [
    PeMessageComponent,
  ],
})
export class PeMessageModule {}
