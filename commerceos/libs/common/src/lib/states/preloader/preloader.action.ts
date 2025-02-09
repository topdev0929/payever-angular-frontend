export enum PreloaderActions {
  StartLoading = '[Preloader] StartLoading',
  StopLoading = '[Preloader] StopLoading',
}

export class StartLoading {
  static readonly type = PreloaderActions.StartLoading;

  constructor(public payload: string) {}
}

export class StopLoading {
  static readonly type = PreloaderActions.StopLoading;

  constructor(public payload: string) {}
}
