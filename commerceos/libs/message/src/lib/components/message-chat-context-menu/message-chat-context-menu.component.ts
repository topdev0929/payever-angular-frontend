import { Component, ChangeDetectionStrategy, Optional, Inject } from '@angular/core';

import { PeDestroyService } from '@pe/common';
import { TranslateService } from '@pe/i18n-core';
import { PeMessageChatRoomContextActions, PeMessageChatRoomContextMenu } from '@pe/message/shared';
import { PebContextMenuComponent, PE_CONTEXTMENU_DATA, PE_CONTEXTMENU_THEME } from '@pe/ui';

@Component({
  selector: 'pe-message-chat-context-menu',
  templateUrl: './message-chat-context-menu.html',
  providers: [PeDestroyService],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PeMessageChatContextMenuComponent extends PebContextMenuComponent {
  separator = PeMessageChatRoomContextMenu.Separator;
  peMessageChatRoomContextActions = PeMessageChatRoomContextActions;

  constructor(
    @Optional() @Inject(PE_CONTEXTMENU_THEME) public theme: string,
    @Optional() @Inject(PE_CONTEXTMENU_DATA) public data: any,
    private translate: TranslateService,
    destroy$: PeDestroyService,
  ) {
    super(theme, data, destroy$);
  }

  public getLabel(data): string {
    let prefix = '';
    if (data.prefix) {
      prefix = data.prefix > 50 ? '+50' : data.prefix;
      prefix += ' ';
    }

    return prefix + this.translate.translate(data.label);
  }
}
