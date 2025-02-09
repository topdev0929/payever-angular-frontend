import { HttpErrorResponse } from '@angular/common/http';

import { PeUser } from '../../user.interface';

export enum UserActions {
  LoadUser = '[@pe/user] LoadUser',
  UserLoaded = '[@pe/user] UserLoaded',
  ResetUser = '[@pe/user] ResetUser',
  LoadFailed = '[@pe/user] LoadFailed',
}

export class LoadUser {
  static readonly type = UserActions.LoadUser;
}

export class UserLoaded {
  static readonly type = UserActions.UserLoaded;

  constructor(public payload: PeUser) {}
}

export class LoadFailed {
  static readonly type = UserActions.LoadFailed;

  constructor(public payload: HttpErrorResponse) {}
}

export class ResetUser {
  static readonly type = UserActions.ResetUser;
}
