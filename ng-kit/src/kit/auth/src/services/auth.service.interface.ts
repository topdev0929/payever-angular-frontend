import { Observable } from 'rxjs';

import { LoginPayload, RegisterPayload } from '../interfaces';

export interface AuthServiceInterface {

  token: string;
  guestToken: string;
  refreshToken: string;

  isAccessTokenExpired(): boolean;
  isGuestTokenExpired(): boolean;
  isRefreshTokenExpired(): boolean;

  login(data: LoginPayload): Observable<string>;
  logout(): Observable<void>;
  register(data: RegisterPayload): Observable<string>;
}
