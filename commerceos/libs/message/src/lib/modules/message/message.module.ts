import { ClipboardModule } from '@angular/cdk/clipboard';
import { DragDropModule } from '@angular/cdk/drag-drop';
import { OverlayModule } from '@angular/cdk/overlay';
import { ScrollingModule as CdkScrollingModule } from '@angular/cdk/scrolling';
import { CommonModule } from '@angular/common';
import { ModuleWithProviders, NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatDialogModule } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSliderModule } from '@angular/material/slider';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatTabsModule } from '@angular/material/tabs';
import { NgxsModule } from '@ngxs/store';

import { PebEnvService } from '@pe/builder/core';
import { PeChatModule, ScrollingModule } from '@pe/chat';
import {
  APP_TYPE,
  AppType,
  EnvironmentConfigInterface,
  PE_ENV,
  PeDestroyService,
  PePreloaderService,
  PreloaderState,
} from '@pe/common';
import { PeDataGridModule } from '@pe/data-grid';
import { PeFoldersActionsService, PeFoldersApiService, PeFoldersModule, PE_FOLDERS_API_PATH } from '@pe/folders';
import { PeGridModule, PeGridState } from '@pe/grid';
import { I18nModule } from '@pe/i18n';
import { MediaModule, MediaUrlPipe, PE_MEDIA_API_PATH } from '@pe/media';
import {
  ChatListFacade,
  ConversationFacade,
  PeMessageApiService,
  PeMessageChatRoomListService,
  PeMessageService,
  PeMessageGuardService,
  PeMessageWebSocketService,
  MessageStateService,
  MessageState,
  MessageAppState,
  PeMessageAppApiService,
  PeMessageAppService,
  PeMessageFoldersApiService,
} from '@pe/message/shared';
import { OverlayWidgetModule, PeOverlayWidgetService, PE_OVERLAY_DATA } from '@pe/overlay-widget';
import { PePlatformHeaderModule } from '@pe/platform-header';
import { PeChatMemberService, PeChatService } from '@pe/shared/chat';
import { PeSidebarModule } from '@pe/sidebar';
import {
  PebButtonModule,
  PebButtonToggleModule,
  PebContextMenuModule,
  PebExpandablePanelModule,
  PebFormBackgroundModule,
  PebFormFieldInputModule,
  PebFormFieldTextareaModule,
  PebLogoPickerModule,
  PebMessagesModule,
  PebProductPickerModule,
  PebSelectModule,
  PeContextMenuService,
  PePickerModule,
  PebCheckboxModule,
  PeLongPressEventDirectiveModule,
} from '@pe/ui';
import { WindowEventsService } from '@pe/window';

import {
  PeMessageBubbleLiveChatComponent,
  PeCreatingChatStepsMainComponent,
  PeCreatingChatStepsTypeComponent,
  PeMessageChatRoomComponent,
  PeMessageForwardFormComponent,
  PeMessageChatRoomFormComponent,
  PeMessageChatRoomListComponent,
  PeMessageChatRoomListHeaderComponent,
  PeMessageChatRoomListHeaderStylesComponent,
  PeMessageChatRoomSettingsComponent,
  PeMessageChatContextMenuComponent,
  PeMessageChatContextSeenListComponent,
  PeMessageFolderFormComponent,
  PeMessageFolderTreeComponent,
  PeMessageLoaderComponent,
  PeMessageNavComponent,
  PeMessageProductListComponent,
  PeMessageSubscriptionListComponent,
  PeMessageAddAdminsComponent,
  PeMessageInviteLinkComponent,
  PeMessageAdditionalChannelSettingsComponent,
  PeMessageEditInfoComponent,
  PeMessagePermissionsComponent,
  PeMessageMailActionsComponent,
  PeMessageOverlayComponent,
  MessageBubbleItemComponent,
  PeMessageMemberSettingsComponent,
  PeMessageGroupRootComponent,
  PeMessageInviteRootComponent,
  PeMessageInviteFormComponent,
  PeCreatingChatFormComponent,
  PeMessageChatPermissionsComponent,
  PePinOverlayComponent,
  PeMessageDeleteTemplateComponent,
  PeChatRoomMessageIntersectionDirective,
  PeMessageConversationComponent,
  PeMessageConversationEmptyListComponent,
  PeMessageConversationListComponent,
  PeMessageConversationSearchComponent,
  PeMessageConversationsComponent,
  PeMessageChatContextMenuStylesComponent,
  PeCreatingChatStepsContactStylesComponent,
  PeCreatingChatStepsContactComponent,
  PeChatListSkeletonComponent,
  PeCreatingIntegrationChannelComponent,
} from '../../components';
import { AdminGuard, RolesGuard } from '../../guards';
import { PeSharedModule } from '../../modules/shared';
import {
  PeMarketingApiService,
  PeMessageChatRoomService,
  PeMessageConversationService,
  PeMessageNavService,
  PeMessageThemeService,
  PeMessageChatBoxService,
  PeMessageOverlayService,
  PeMessageAppsService,
  PeMessageLiveChatService,
  PeMessageChannelSettingsService,
  PeMessageEnvService,
  PeMessageIntegrationService,
  PeMessageInvitationApiService,
  MessageRuleService,
  PeMessageChatContextMenuService,
  PeMessageFileUploadService,
  PeMessageVirtualService,
  ContactsDialogService,
  MessageChatDialogService,
  PeLiveChatSessionService,
} from '../../services';

import { PeMessageComponent } from './message.component';

(window as any)?.PayeverStatic?.IconLoader?.loadIcons([
  'apps',
  'settings',
  'builder',
]);

export const messageI18nModuleForRoot = I18nModule.forRoot();
export const ngxsForFeatureModule = NgxsModule.forFeature([MessageState, PreloaderState, PeGridState, MessageAppState]);

@NgModule({
  imports: [
    ClipboardModule,
    CommonModule,
    DragDropModule,
    FormsModule,
    ReactiveFormsModule,
    MatMenuModule,
    MatDialogModule,
    MatTabsModule,
    PebLogoPickerModule,
    MatSliderModule,
    MatIconModule,
    PeFoldersModule,
    PeGridModule,
    PeSharedModule,

    messageI18nModuleForRoot,
    MediaModule,
    OverlayModule,
    OverlayWidgetModule,

    PebContextMenuModule,
    PebButtonModule,
    PebExpandablePanelModule,
    PebFormBackgroundModule,
    PebFormFieldInputModule,
    PebButtonToggleModule,
    PeLongPressEventDirectiveModule,
    PeChatModule,
    PeDataGridModule,
    PePickerModule,
    PeSidebarModule,
    PebCheckboxModule,
    PebSelectModule,
    PePlatformHeaderModule,
    PebFormFieldTextareaModule,
    PebMessagesModule,
    PebProductPickerModule,
    MatProgressSpinnerModule,
    MatSnackBarModule,
    ngxsForFeatureModule,
    ScrollingModule,
    CdkScrollingModule,
  ],
  declarations: [
    PeMessageConversationComponent,
    PeMessageConversationsComponent,
    PeChatRoomMessageIntersectionDirective,
    PeMessageConversationEmptyListComponent,
    PeMessageConversationListComponent,
    PeMessageConversationSearchComponent,
    PeMessageComponent,
    PeMessageChatRoomComponent,
    PeMessageForwardFormComponent,
    PeMessageChatRoomFormComponent,
    PeMessageChatRoomListComponent,
    PeMessageChatRoomListHeaderComponent,
    PeMessageChatRoomListHeaderStylesComponent,
    PeMessageChatRoomSettingsComponent,
    PeMessageChatContextMenuComponent,
    PeMessageChatContextMenuStylesComponent,
    PeMessageChatContextSeenListComponent,
    PeCreatingChatFormComponent,
    PeMessageInviteFormComponent,
    PeCreatingChatStepsMainComponent,
    PeCreatingIntegrationChannelComponent,
    PeCreatingChatStepsContactComponent,
    PeCreatingChatStepsContactStylesComponent,
    PeCreatingChatStepsTypeComponent,
    PeMessageProductListComponent,
    PeMessageFolderFormComponent,
    PeMessageFolderTreeComponent,
    PeMessageLoaderComponent,
    PeMessageNavComponent,
    MessageBubbleItemComponent,
    PeMessageBubbleLiveChatComponent,
    PeMessageSubscriptionListComponent,
    PeMessageAddAdminsComponent,
    PeMessageInviteLinkComponent,
    PeMessageAdditionalChannelSettingsComponent,
    PeMessageMemberSettingsComponent,
    PeMessageEditInfoComponent,
    PeMessagePermissionsComponent,
    PeMessageChatPermissionsComponent,
    PeMessageGroupRootComponent,
    PeMessageInviteRootComponent,
    PeMessageMailActionsComponent,
    PeMessageOverlayComponent,
    PeChatListSkeletonComponent,
    PePinOverlayComponent,
    PeMessageDeleteTemplateComponent,
  ],
  providers: [
    PeLiveChatSessionService,
    PeMessageInvitationApiService,
    PeChatMemberService,
    PeMessageApiService,
    ContactsDialogService,
    MessageChatDialogService,
    MessageStateService,
    PeMessageChatRoomService,
    PeMessageChatRoomListService,
    PeMessageConversationService,
    PeMessageNavService,
    PeMessageService,
    PeMessageThemeService,
    PeMessageChatBoxService,
    PeMessageGuardService,
    PeMarketingApiService,
    PeMessageOverlayService,
    PeMessageWebSocketService,
    PeMessageFileUploadService,
    PeMessageAppsService,
    PeMessageLiveChatService,
    PeMessageChannelSettingsService,
    PeMessageVirtualService,
    AdminGuard,
    RolesGuard,

    MediaUrlPipe,
    PeChatService,
    PeContextMenuService,
    PeMessageChatContextMenuService,
    PeFoldersActionsService,
    PeFoldersApiService,
    PeOverlayWidgetService,
    MessageRuleService,
    PeDestroyService,
    PePreloaderService,
    PeMessageFoldersApiService,
    PeMessageAppService,
    PeMessageAppApiService,
    WindowEventsService,
    {
      deps: [PE_ENV],
      provide: PE_FOLDERS_API_PATH,
      useFactory: (env: EnvironmentConfigInterface) => env.backend.message + '/api',
    },
    {
      provide: PebEnvService,
      useClass: PeMessageEnvService,
    },
    ChatListFacade,
    ConversationFacade,
    {
      provide: PE_OVERLAY_DATA,
      useValue: {},
    },
    {
      provide: APP_TYPE,
      useValue: AppType.Message,
    },
    {
      provide: PE_MEDIA_API_PATH,
      deps: [PE_ENV],
      useFactory: (env: any) => env.backend.media,
    },
  ],
  exports: [
    PeMessageComponent,
  ],
})
export class PeMessageModule {
  static forFeature(appType: AppType): ModuleWithProviders<PeMessageModule> {
    return {
      ngModule: PeMessageModule,
      providers: [
        {
          provide: APP_TYPE,
          useValue: appType,
        },
      ],
    };
  }

  static forEmbed(): ModuleWithProviders<PeMessageModule> {
    return {
      ngModule: PeMessageModule,
      providers: [
        PeMessageIntegrationService,
      ],
    };
  }
}
