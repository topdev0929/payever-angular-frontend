import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

import { TreeFilterNode } from '@pe/common';

import { PeMessageColumn } from '../enums';
import { PeMessageFolder } from '../interfaces';

import { PeMessageChatRoomListService } from './message-chat-room-list.service';
import { PeMessageService } from './message.service';

@Injectable()
export class PeMessageNavService {

  private activeFolderBs = new BehaviorSubject<PeMessageFolder | null>(null);
  activeFolder$ = this.activeFolderBs.asObservable();
  get activeFolder(): PeMessageFolder | null {
    return this.activeFolderBs.value;
  }
  set activeFolder(folder: PeMessageFolder | null) {
    if (this.peMessageChatRoomListService.mobileView) {
      this.peMessageService.activeColumn = PeMessageColumn.List;
    }
    this.activeFolderBs.next(folder);
  }

  folderList: PeMessageFolder[] = [];
  folderTree: TreeFilterNode[] = [];

  constructor(
    private peMessageService: PeMessageService,
    private peMessageChatRoomListService: PeMessageChatRoomListService,
  ) {}

}
