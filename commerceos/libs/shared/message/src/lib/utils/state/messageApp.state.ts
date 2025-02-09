import { Injectable } from '@angular/core';
import { Action, Selector, State, StateContext } from '@ngxs/store';

import { InitMessages, SetChannelsToShow, SetMessagesToShow } from './messageApp.actions';
import { MessageStateInterface } from './messageApp.interface';

@State<MessageStateInterface>({
  name: 'messages',
  defaults: {
    messages: undefined,
    channelsToShow: undefined,
    messagesToShow: undefined,
  },
})
@Injectable()
export class MessageAppState {
  @Selector()
  static Messages(state: MessageStateInterface) {
    return state.messages;
  }

  @Selector()
  static ChannelsToShow(state: MessageStateInterface) {
    return state.channelsToShow;
  }

  @Selector()
  static MessagesToShow(state: MessageStateInterface) {
    return state.messagesToShow;
  }

  @Action(InitMessages)
  setMessages(ctx: StateContext<MessageStateInterface>, action: InitMessages) {
    const messages = action.payload;
    ctx.patchState({ messages });
  }

  @Action(SetChannelsToShow)
  setChannelsToShow(ctx: StateContext<MessageStateInterface>, action: SetChannelsToShow) {
    const channelsToShow = action.payload;
    ctx.patchState({ channelsToShow });
  }

  @Action(SetMessagesToShow)
  setMessagesToShow(ctx: StateContext<MessageStateInterface>, action: SetMessagesToShow) {
    const messagesToShow = action.payload;
    ctx.patchState({ messagesToShow });
  }
}
