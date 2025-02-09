import { Injectable, Provider } from '@angular/core';
import { JwtHelperService } from '@auth0/angular-jwt';
import { Observable, of } from 'rxjs';

import { LoginPayload, RegisterPayload } from '../interfaces';

import { PeAuthService } from './auth.service';
import { AuthServiceInterface } from './auth.service.interface';

const authToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyIjp7InRva2VuSWQiOiIwNWVkMzI4ZC03M2FmLTRiZjQtOTg3OS1kNGEzMWEzNzEyZjAiLCJpZCI6IjI2NzNmYTQ1LTgyYjktNDg0Yy1iY2JlLTQ2ZGEyNTBjMjYzOSIsImVtYWlsIjoidGVzdGNhc2VzQHBheWV2ZXIuZGUiLCJmaXJzdE5hbWUiOiJUZXN0IiwibGFzdE5hbWUiOiJUZXN0Iiwicm9sZXMiOlt7Im5hbWUiOiJtZXJjaGFudCIsInBlcm1pc3Npb25zIjpbXSwidGFncyI6W119XSwidG9rZW5UeXBlIjowLCJoYXNoIjoiOGJhY2I4OWMzNmI0NGQwOWIzMDQ5NjU5MDIwZGFlOTA0Y2YxYTNmNzZmOWMxMDBiYTIzZjM5MDFkMDA5MWUwNyJ9LCJpYXQiOjE3NzcxMDc3MzYsImV4cCI6MTc3NzE5NDEzNn0.JYWfx6rqvjf7I1f0ODXh7Ic91eduB8aIMlkCv-kAX8A';
const refreshToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJwYXlsb2FkIjp7ImVtYWlsIjoidGVzdGNhc2VzQHBheWV2ZXIuZGUiLCJmaXJzdE5hbWUiOiJUZXN0IiwibGFzdE5hbWUiOiJUZXN0IiwidG9rZW5JZCI6IjVlMDBjMTE4N2IzOGRlMDAxYmRiNThhZCIsInVzZXJJZCI6IjI2NzNmYTQ1LTgyYjktNDg0Yy1iY2JlLTQ2ZGEyNTBjMjYzOSJ9LCJpYXQiOjE3NzcxMDc3MzYsImV4cCI6MTc3OTY5OTczNn0.AKyVKSXYlBPYULR3kstmqbPiPXqmwR-WdyBSYZ_g0fo';

const authTokenExpited = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyIjp7InRva2VuSWQiOiIwNWVkMzI4ZC03M2FmLTRiZjQtOTg3OS1kNGEzMWEzNzEyZjAiLCJpZCI6IjI2NzNmYTQ1LTgyYjktNDg0Yy1iY2JlLTQ2ZGEyNTBjMjYzOSIsImVtYWlsIjoidGVzdGNhc2VzQHBheWV2ZXIuZGUiLCJmaXJzdE5hbWUiOiJUZXN0IiwibGFzdE5hbWUiOiJUZXN0Iiwicm9sZXMiOlt7Im5hbWUiOiJtZXJjaGFudCIsInBlcm1pc3Npb25zIjpbXSwidGFncyI6W119XSwidG9rZW5UeXBlIjowLCJoYXNoIjoiOGJhY2I4OWMzNmI0NGQwOWIzMDQ5NjU5MDIwZGFlOTA0Y2YxYTNmNzZmOWMxMDBiYTIzZjM5MDFkMDA5MWUwNyJ9LCJpYXQiOjE1NjcxMDc3MzYsImV4cCI6MTU2NzE5NDEzNn0.z1inMAa3WewbO2DW46kF_ShJsxp4AJAFIWw6pkKb9VY';
const refreshTokenExpited = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJwYXlsb2FkIjp7ImVtYWlsIjoidGVzdGNhc2VzQHBheWV2ZXIuZGUiLCJmaXJzdE5hbWUiOiJUZXN0IiwibGFzdE5hbWUiOiJUZXN0IiwidG9rZW5JZCI6IjVlMDBjMTE4N2IzOGRlMDAxYmRiNThhZCIsInVzZXJJZCI6IjI2NzNmYTQ1LTgyYjktNDg0Yy1iY2JlLTQ2ZGEyNTBjMjYzOSJ9LCJpYXQiOjE1NjcxMDc3MzYsImV4cCI6MTU2OTY5OTczNn0.h7CN0NtnZs7XJt3jcxX_iKfm0tG9tICDopCdp-yOKCA';

@Injectable()
export class AuthStubService implements AuthServiceInterface {

  // tslint:disable
  private _token: string;
  private _guestToken: string;
  private _refreshToken: string;

  static provide(): Provider {
    return {
      provide: PeAuthService,
      useClass: AuthStubService,
    };
  }

  get token(): string {
    return this._token;
  }

  get guestToken(): string {
    return this._guestToken;
  }

  get refreshToken(): string {
    return this._refreshToken;
  }

  isAccessTokenExpired(): boolean {
    return !this.token || this.jwtHelper.isTokenExpired(this.token);
  }

  isGuestTokenExpired(): boolean {
    return !this.guestToken || this.jwtHelper.isTokenExpired(this.guestToken);
  }

  isRefreshTokenExpired(): boolean {
    return !this.refreshToken || this.jwtHelper.isTokenExpired(this.refreshToken);
  }

  login(data: LoginPayload): Observable<string> {
    this.testGenerateAuthToken(false);
    this.testGenerateRefreshToken(false);

    return of(this._token);
  }

  logout(): Observable<void> {
    this._token = null;
    this._refreshToken = null;

    return of(null);
  }

  register(data: RegisterPayload): Observable<string> {
    return this.login(data);
  }

  testGenerateAuthToken(isExpited: boolean): void {
    this._token = isExpited ? authTokenExpited : authToken;
  }

  testGenerateRefreshToken(isExpited: boolean): void {
    this._refreshToken = isExpited ? refreshTokenExpited : refreshToken;
  }

  private get jwtHelper(): JwtHelperService {
    return new JwtHelperService();
  }
}
