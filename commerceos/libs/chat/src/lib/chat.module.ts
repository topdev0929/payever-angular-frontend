import { OverlayModule } from '@angular/cdk/overlay';
import { ScrollingModule as CdkScrollingModule } from '@angular/cdk/scrolling';
import { TextFieldModule } from '@angular/cdk/text-field';
import { CommonModule } from '@angular/common';
import { ModuleWithProviders, NgModule, Provider } from "@angular/core";
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { RouterModule } from '@angular/router';
import { PickerModule } from '@ctrl/ngx-emoji-mart';
import { NgxsModule } from '@ngxs/store';

// eslint-disable-next-line @nrwl/nx/enforce-module-boundaries
import { PebOptionsState } from '@pe/builder/state';
import { APP_TYPE, AppType, PePreloaderService } from '@pe/common';
import { I18nModule } from '@pe/i18n';
import { MediaModule } from '@pe/media';
import { PeChatMemberService } from '@pe/shared/chat';
import { PebButtonToggleModule, PebFormFieldInputModule, PebSelectModule, PebButtonModule } from '@pe/ui';

import { PeChatComponent } from './chat.component';
import { PeChatOptions } from './chat.options';
import {
  ChatMessageHeaderComponent,
  PeChatAutocompleteComponent,
  PeChatFormEmojiPickerComponent,
  PeChatFormEmojiPickerStylesComponent,
  PeChatForwardMenuComponent,
  PeChatForwardSenderComponent,
  PeChatHeaderComponent,
  PeChatHeaderTagStylesComponent,
  PeChatHeaderTagComponent,
  PeChatMessageComponent,
  PeChatFormComponent,
  PeAttachMenusStylesComponent,
  PeFileUploadComponent,
  PeDropBoxComponent,
  PeChatMessageFileComponent,
  PeChatMessageFileListComponent,
  PeChatMessageFileLoaderComponent,
  PeChatMessageMediaListComponent,
  PeChatMessageMailComponent,
  PeChatMessageQuoteComponent,
  PeChatMessageTemplateComponent,
  PeChatMessageTextComponent,
  PeChatSelectComponent,
  PeChatTypingDotsComponent,
} from './components';
import {
  SafePipe,
  PeTimeAgoPipe,
  PeChatInitialsPipe,
  PeTagTransformerPipe,
  PeTruncatingPipe,
  PeTypingMembersPipe,
} from './pipes';
import { ScrollingModule } from './scrolling/scrolling.module';

export const pebElementSelectionState = NgxsModule.forFeature([PebOptionsState]);
(window as any).PayeverStatic?.IconLoader?.loadIcons([
  'messaging',
]);

function getChatOptionsProvider(options?: PeChatOptions): Provider {
  return { provide: PeChatOptions, useValue: options || {} }
}

const PE_CHAT_COMPONENTS = [
  PeChatAutocompleteComponent,
  PeChatComponent,
  PeChatFormComponent,
  PeChatHeaderComponent,
  PeChatTypingDotsComponent,
  PeChatMessageComponent,
  PeChatFormEmojiPickerComponent,
  PeChatMessageFileComponent,
  PeChatMessageQuoteComponent,
  PeChatMessageTemplateComponent,
  PeChatMessageTextComponent,
  PeChatSelectComponent,
  PeChatMessageMailComponent,
  PeFileUploadComponent,
  PeAttachMenusStylesComponent,
  PeChatHeaderTagComponent,
  PeDropBoxComponent,
  PeChatHeaderTagStylesComponent,
  PeChatForwardSenderComponent,
  PeChatForwardMenuComponent,
];

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    OverlayModule,
    TextFieldModule,
    ReactiveFormsModule,
    RouterModule,
    PebButtonToggleModule,
    PebFormFieldInputModule,
    PebSelectModule,
    PebButtonModule,
    I18nModule,
    pebElementSelectionState,
    PickerModule,
    MatMenuModule,
    MatAutocompleteModule,
    MatIconModule,
    MatProgressSpinnerModule,
    ScrollingModule,
    CdkScrollingModule,
    MediaModule,
  ],
  declarations: [
    ...PE_CHAT_COMPONENTS,
    PeChatFormEmojiPickerStylesComponent,
    PeChatInitialsPipe,
    PeChatMessageFileListComponent,
    PeChatMessageFileLoaderComponent,
    PeChatMessageMediaListComponent,
    PeTruncatingPipe,
    PeTypingMembersPipe,
    SafePipe,
    PeTimeAgoPipe,
    PeTagTransformerPipe,
    ChatMessageHeaderComponent,
  ],
  exports: [...PE_CHAT_COMPONENTS],
  providers: [
    PeChatMemberService,
    PePreloaderService,
    PeTruncatingPipe,
    PeTypingMembersPipe,
    {
      provide: APP_TYPE,
      useValue: AppType.Message,
    },
  ],
})
export class PeChatModule {
  static forRoot(options?: PeChatOptions): ModuleWithProviders<PeChatModule> {
    return {
      ngModule: PeChatModule,
      providers: [getChatOptionsProvider(options)],
    };
  }

  static forChild(options?: PeChatOptions): ModuleWithProviders<PeChatModule> {
    return {
      ngModule: PeChatModule,
      providers: [getChatOptionsProvider(options)],
    };
  }
}
