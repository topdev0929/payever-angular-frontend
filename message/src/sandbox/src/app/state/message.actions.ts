export enum MessageActions {
  messageTheme = '[@pe/chat] messageTheme',
}

export class SetMessageTheme {
  static type = MessageActions.messageTheme;

  constructor(public messageTheme: any) { }
}
