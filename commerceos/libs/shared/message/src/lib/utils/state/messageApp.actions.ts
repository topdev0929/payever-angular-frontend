import { PeMessageChat, PeChatMessage } from "@pe/shared/chat";

export class InitMessages {
    static readonly type = '[Message] Init Messages';
    constructor(public payload: PeMessageChat[]) {}
}

export class SetChannelsToShow {
    static readonly type = '[Message] Set Show Channels';
    constructor(public payload: PeMessageChat[]) {}
}
  
export class SetMessagesToShow {
    static readonly type = '[Message] Set Show Messages';
    constructor(public payload: PeChatMessage[]) {}
}
  