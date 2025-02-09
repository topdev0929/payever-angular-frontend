import { CreateUserAccountConfigDto, RegisterData, Tokens } from './models';
import { LoginDto } from './models/login.dto';

export class SetTokens {
  static readonly type = '[Auth] Set tokens';
  constructor(public readonly payload: Partial<Tokens>) {}
}

export class Login {
  static readonly type = '[Auth] Login';
  constructor(public readonly payload: LoginDto) {}
}

export class Logout {
  static readonly type = '[Auth] Logout';
}

export class Register {
  static readonly type = '[Auth] Register';
  constructor(
    public readonly flowId: string,
    public readonly payload: RegisterData,
    public readonly config: CreateUserAccountConfigDto,
  ) {}
}

export class RefreshToken {
  static readonly type = '[Auth] Refresh token';
  constructor(public readonly token: string) {}
}

export class UpdateFlowAuthorization {
  static readonly type = '[Auth] Update flow authorization';
  constructor(
    public readonly flowId: string,
    public readonly oldToken: string
  ) {}
}
