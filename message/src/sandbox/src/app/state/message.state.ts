import { Injectable } from '@angular/core';
import { Action, Selector, State, StateContext } from '@ngxs/store';

import * as MessageActions from './message.actions';

const messageStateName = 'peMessageState';

export interface PeMessageState {
  messageTheme: any;
}

@State<PeMessageState>({
  name: messageStateName,
  defaults: {
    messageTheme: null,
  },
})
@Injectable()
export class MessageState {
  @Selector()
  static messageTheme(state: PeMessageState): any {
    return state.messageTheme;
  }

  constructor() {}

  @Action(MessageActions.SetMessageTheme)
  setMessageTheme(ctx: StateContext<PeMessageState>, { messageTheme }: MessageActions.SetMessageTheme) {
    ctx.patchState({
      messageTheme: messageTheme,
    });
  }
}
