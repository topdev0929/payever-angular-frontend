import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { combineLatest, Observable, of, Subject, throwError } from 'rxjs';
import {
  catchError, delay, flatMap, filter, distinctUntilChanged, map, startWith, take, mapTo, tap
} from 'rxjs/operators';
import { values } from 'lodash-es';

import { JwtHelperService } from '@auth0/angular-jwt';
// Long paths are here to avoid circular dependencies
import { TranslateService } from '../../../i18n/src/services/translate';
import * as Cookie from 'js-cookie';

import { LoginPayload, LoginResponse, RegisterPayload, RegisterResponse } from '../interfaces';

// Long paths are here to avoid circular dependencies
import { EnvironmentConfigService } from '../../../environment-config/src/services/environment-config.service';
import { NodeJsBackendConfigInterface, CustomConfigInterface } from '../../../environment-config/src/interfaces';
import { MicroRegistryService } from '../../../micro/src/services';
import { MicroAppInterface } from '../../../micro/src/types';
import { PlatformService } from '../../../common/src/services/platform.service';
import { PlatformEventInterface } from '../../../common/src/interfaces/platform-event.interface';
import { EnvironmentConfigInterface } from './../../../environment-config/src/interfaces/environment-config.interface';
import { AuthServiceInterface } from './auth.service.interface';

const jsonpack: any = require('jsonpack/main');

const AUTH_EVENT: string = 'auth_event';
const AUTH_EVENT_ACTION: string = 'refreshing_token';

export enum AuthTokenType {
  default = 0,
  permanent2fa = 1,
  temporary2fa = 2
}

export interface AuthUserData {
  uuid: string;
  first_name: string;
  last_name: string;
  email: string;
  roles: any;
  tokenType?: AuthTokenType;
}

export interface AuthTokenPayload {
  email?: string;
  firstName?: string;
  lastName?: string;
  tokenId?: string;
  userId?: string;
}

export interface ExtraLoginData {
  activeBusiness: any;
  email?: string;
}

export interface IErrorEntryDetails {
  children: any[];
  constraints: {
    [key: string]: string
  };
  property: string;
  value: string;
}

export interface IErrorEntryResponse {
  error: {
    errors: IErrorEntryDetails[];
    message: string;
    reason?: string;
    statusCode: number;
  };
  message: string;
}

export enum AuthHeadersEnum {
  anonym = 'pe_anonym',
  refresh = 'pe_refresh',
}

export interface SetTokensInterface {
  accessToken?: string;
  refreshToken?: string;
  guestToken?: string;
}

export interface CreateUserAccountConfigInterface {
  hasUnfinishedBusinessRegistration?: boolean;
}

const IS_2FA_JUST_PASSED: string = 'pe_isSecondFactorJustPassedAsTemporary';
const ACCESS_TOKEN_COOKIE_NAME: string = 'pe_auth_token';
const REFRESH_TOKEN_COOKIE_NAME: string = 'pe_refresh_token';
const GUEST_TOKEN_COOKIE_NAME: string = 'pe_guest_token';

@Injectable()
export class AuthService implements AuthServiceInterface {

  readonly jwtHelper: JwtHelperService;
  readonly onChange$: Observable<void>;

  private _authUserData: AuthUserData = null;
  private refreshingAccessToken: boolean = false;
  private refreshingToken$: Observable<boolean> = this.platformService.platformEvents$.pipe(
    filter((event: PlatformEventInterface) => event.target === AUTH_EVENT),
    map((event: PlatformEventInterface) => (event.data.refreshing)),
    startWith(false),
    distinctUntilChanged(),
  );

  constructor(
    private http: HttpClient,
    private configService: EnvironmentConfigService,
    private translateService: TranslateService,
    private router: Router,
    private microRegistry: MicroRegistryService,
    private platformService: PlatformService
  ) {
    this.jwtHelper = new JwtHelperService();
    this.onChange$ = this.onChangeSubject.asObservable();

    if (this.configService.isDev() && (!this.token || !this.refreshToken)) {
      console.warn(`Don't forget to set auth values "${ACCESS_TOKEN_COOKIE_NAME}" and "${REFRESH_TOKEN_COOKIE_NAME}" to cookies for development`);
    }

    // Make to all service instances know we are refreshing token already
    this.refreshingToken$.subscribe(refreshing => this.refreshingAccessToken = refreshing);
  }

  private get onChangeSubject(): Subject<void> {
    // TODO Find better solution for case when we have multiple instances of AuthService
    if (!window['pe_auth_service_on_change_subj']) {
      window['pe_auth_service_on_change_subj'] = new Subject<void>();
    }
    return window['pe_auth_service_on_change_subj'];
  }

  get token(): string {
    // Cookie is left temporary for back compatibility
    return localStorage.getItem(ACCESS_TOKEN_COOKIE_NAME) || Cookie.get(ACCESS_TOKEN_COOKIE_NAME) || '';
  }

  get guestToken(): string {
    return localStorage.getItem(GUEST_TOKEN_COOKIE_NAME) || '';
  }

  get refreshToken(): string {
    // Cookie is left temporary for back compatibility
    return localStorage.getItem(REFRESH_TOKEN_COOKIE_NAME) || Cookie.get(REFRESH_TOKEN_COOKIE_NAME) || '';
  }

  get prefferedCheckoutToken(): string {
    if (window.location.hostname === this.configService.getFrontendConfig().commerceos.split('://')[1]) {
      return this.token;
    }
    if (this.guestToken && !this.isGuestTokenExpired()) {
      return this.guestToken;
    }
    if (this.token && !this.isAccessTokenExpired()) {
      return this.token;
    }
    return null;
  }

  // Data for extra-login(not related with login/logout)
  set refreshLoginData(data: ExtraLoginData) {
    if (data.activeBusiness) {
      localStorage.setItem('pe_active_business', JSON.stringify(data.activeBusiness));
      localStorage.setItem('pe_user_email', this.getUserData().email || data.email);
    }
  }

  get refreshLoginData(): ExtraLoginData {
    return {
      activeBusiness: JSON.parse(localStorage.getItem('pe_active_business')),
      email: localStorage.getItem('pe_user_email')
    };
  }

  getUserData(): AuthUserData {
    this._initTokenData();
    return this._authUserData;
  }

  getRefershTokenData(): AuthTokenPayload {
    const refreshToken: any = this.refreshToken;
    if (refreshToken) {
      const decodedToken: any = this.jwtHelper.decodeToken(this.refreshToken);
      return decodedToken.payload;
    } else {
      return {};
    }
  }

  isAdmin(): boolean {
    const user: AuthUserData = this.getUserData();
    return Boolean((user.roles || []).find((a: any) => a.name === 'admin'));
  }

  isSecondFactorAuthPassedAsPermanent(): boolean {
    const user: AuthUserData = this.getUserData();
    return user.tokenType === AuthTokenType.permanent2fa;
  }

  isSecondFactorAuthPassedAsTemporary(): boolean {
    const user: AuthUserData = this.getUserData();
    return user.tokenType === AuthTokenType.temporary2fa;
  }

  isSecondFactorAuthPassed(): boolean {
    return this.isSecondFactorAuthPassedAsPermanent() || this.isSecondFactorAuthPassedAsTemporary();
  }

  resetTemporarySecondFactor(): Observable<boolean> {
    if (this.isSecondFactorAuthPassedAsTemporary()) {
      return this.asyncRefreshAccessToken().pipe(map(() => {
        window[IS_2FA_JUST_PASSED] = false;
        return true;
      }));
    } else {
      return of(false);
    }
  }

  isSecondFactorJustPassed(): boolean {
    // This flag is resetted on page refresh. We need it for transactions edit.
    return !!window[IS_2FA_JUST_PASSED];
  }

  setTokens(tokens: SetTokensInterface): Observable<void> {
    return combineLatest([
      tokens.accessToken !== undefined ? this.setToken(tokens.accessToken) : of(null),
      tokens.refreshToken !== undefined ? this.setRefreshToken(tokens.refreshToken) : of(null),
      tokens.guestToken !== undefined ? this.setGuestToken(tokens.guestToken) : of(null)
    ])
      .pipe(
        mapTo(null)
      );
  }

  clearSession(): Observable<void> {
    return this.setTokens({ accessToken: '', refreshToken: '', guestToken: '' });
  }

  setToken(token: string): Observable<void> {
    if (token !== '') {
      this.checkToken(ACCESS_TOKEN_COOKIE_NAME, token);
    }
    let result: Observable<void> = null;
    if (token === this.token) {
      result = of(null);
    } else {
      if (token) {
        localStorage.setItem(ACCESS_TOKEN_COOKIE_NAME, token);
        if (!this.token) {
          console.error(`The '${ACCESS_TOKEN_COOKIE_NAME}' was not set correctly!`);
        }
      } else {
        localStorage.removeItem(ACCESS_TOKEN_COOKIE_NAME);
      }
    }
    // If we set auth token - we must reset guest token. Why?
    // Because of following situation: user creates checkout flow and gets guest token set.
    // After that he logins in commerceos and opens connect app.
    // So he has both auth and guest tokens and guest token has higher priority.
    // As result for requests in connect app a wrong guest token used and user gets error 403.
    return token ? result.pipe(flatMap(() => this.setGuestToken(null))) : result;
  }

  setGuestToken(token: string): Observable<void> {
    token = token || '';
    if (token !== '') {
      this.checkToken(GUEST_TOKEN_COOKIE_NAME, token);
    }
    if (token !== this.guestToken) {
      if (token) {
        localStorage.setItem(GUEST_TOKEN_COOKIE_NAME, token);
        if (!this.guestToken) {
          console.error(`The '${GUEST_TOKEN_COOKIE_NAME}' was not set correctly!`);
        }
        if (!this.isCommerceosDomain(window.location.hostname)) {
          // For back compatibility. At commerceos we use auth token, so need only for other domains.
          // TODO Remove when all checkout wrapper payments are migrated to new ng-kit
          Cookie.set(GUEST_TOKEN_COOKIE_NAME, token);
        }
      } else {
        localStorage.removeItem(GUEST_TOKEN_COOKIE_NAME);
      }
    }
    return of(null);
  }

  setRefreshToken(token: string): Observable<void> {
    if (token !== '') {
      this.checkToken(REFRESH_TOKEN_COOKIE_NAME, token);
    }
    let result: Observable<void> = null;
    if (token === this.refreshToken) {
      result = of(null);
    } else {
      if (token) {
        localStorage.setItem(REFRESH_TOKEN_COOKIE_NAME, token);
        if (!this.refreshToken) {
          console.error(`The '${REFRESH_TOKEN_COOKIE_NAME}' was not set correctly!`);
        }
      } else {
        localStorage.removeItem(REFRESH_TOKEN_COOKIE_NAME);
      }
    }
    return result;
  }

  login(data: LoginPayload): Observable<string> {
    const backendConfig: NodeJsBackendConfigInterface = this.configService.getConfig().backend;
    return this.http.post<LoginResponse>(`${backendConfig.auth}/api/login`, data, this.createAnonymHeader()
    ).pipe(
      catchError((errors: IErrorEntryResponse) => {
        return throwError(this.createErrorBag(errors));
      }),
      map((resp: any) => <any>resp), // some issue in type defs
      flatMap((res: LoginResponse) => {
        if (res.accessToken) {
          return this.setToken(res.accessToken).pipe(map(() => res));
        } else {
          // we have 2FA
          return of(res);
        }
      }),
      flatMap((res: LoginResponse) => {
        return this.setRefreshToken(res.refreshToken).pipe(map(() => res));
      }),
      map((res: LoginResponse) => {
        return res.accessToken;
      }),
      tap(() => this.onChangeSubject.next())
    );
  }

  logout(): Observable<void> {
    this._authUserData = null;
    return this.setToken('').pipe(
      flatMap(() => {
        if (this.configService.isDev()) {
          this.clearDevAuthToken();
        }
        return this.setRefreshToken('');
      }),
      map(() => {
        if (this.configService.isDev()) {
          this.clearDevRefreshToken();
        }
        this._authUserData = null;
        this.redirectToEntryPage('entry/refresh-login', this.router.url);
        return null;
      }),
      tap(() => this.onChangeSubject.next())
    );
  }

  /**
   * to set auth_token document cookie
   */
  clearDevAuthToken(): void {
    localStorage.removeItem(ACCESS_TOKEN_COOKIE_NAME);
    document.cookie = `${ACCESS_TOKEN_COOKIE_NAME}=;path=/`;
  }

  /**
   * to set refresh_token document cookie
   */
  clearDevRefreshToken(): void {
    localStorage.removeItem(REFRESH_TOKEN_COOKIE_NAME);
    document.cookie = `${REFRESH_TOKEN_COOKIE_NAME}=;path=/`;
  }

  register(data: RegisterPayload, config: CreateUserAccountConfigInterface = null): Observable<string> {
    const backendConfig: NodeJsBackendConfigInterface = this.configService.getConfig().backend;
    return this.http.post<RegisterResponse>(`${backendConfig.auth}/api/register`, data).pipe(
      catchError((errors: IErrorEntryResponse) => {
        return throwError(this.createErrorBag(errors));
      }),
      flatMap((res: LoginResponse) => {
        return this.setToken(res.accessToken).pipe(map(() => res));
      }),
      flatMap((res: LoginResponse) => {
        return this.setRefreshToken(res.refreshToken).pipe(map(() => res));
      }),
      flatMap((res: LoginResponse) => {
        return config ? this.http.post<void>(`${backendConfig.users}/api/user`, config).pipe(map(() => res)) : of(res);
      }),
      map((tokens: RegisterResponse) => {
        return tokens.accessToken;
      })
    );
  }

  secondFactorCode(code: string): Observable<string> {
    const backendConfig: NodeJsBackendConfigInterface = this.configService.getConfig().backend;
    return this.http.post<RegisterResponse>(`${backendConfig.auth}/api/2fa/auth`, { secondFactorCode: code }, this.createRefreshHeader()).pipe(
      catchError((errors: IErrorEntryResponse) => {
        return throwError(this.createErrorBag(errors));
      }),
      flatMap((res: LoginResponse) => {
        return this.setToken(res.accessToken).pipe(map(() => res));
      }),
      flatMap((res: LoginResponse) => {
        return this.setRefreshToken(res.refreshToken).pipe(map(() => res));
      }),
      map((tokens: RegisterResponse) => {
        window[IS_2FA_JUST_PASSED] = true;
        return tokens.accessToken;
      })
    );

  }

  repeatSendCode(): Observable<void> {
    const backendConfig: NodeJsBackendConfigInterface = this.configService.getConfig().backend;
    return this.http.post<RegisterResponse>(`${backendConfig.auth}/api/2fa/resend`, {}, this.createRefreshHeader()).pipe(
      catchError((errors: IErrorEntryResponse) => {
        return throwError(this.createErrorBag(errors));
      }),
      map(() => undefined)
    );
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

  // Probably not using
  refreshAccessToken(reason: string = null): void {
    this._refreshAccessToken();
  }

  isGuestTokenAllowed(url: string): boolean {
    let result: boolean = false;
    if (this.configService.getConfig()) {
      const backends: string[] = [
        this.configService.getConfig().backend.payments,
        this.configService.getConfig().backend.connect,
        this.configService.getConfig().backend.billingSubscription,
        this.configService.getConfig().backend.paymentNotifications,
        this.configService.getConfig().thirdParty.payments
      ].map(a => this.getUrlHostname(a));
      result = backends.indexOf(this.getUrlHostname(url)) >= 0;
    }
    return result;
  }

  isPayeverBackend(url: string): boolean {
    let result: boolean = false;
    if (this.configService.getConfig()) {
      const backends: string[] = [
        ...values(this.configService.getConfig().backend || {}),
        ...values(this.configService.getConfig().connect || {}),
        ...values(this.configService.getConfig().thirdParty || {}),
        ...values(this.configService.getConfig().payments || {})
      ].map(a => this.getUrlHostname(a));
      result = backends.indexOf(this.getUrlHostname(url)) >= 0;
    }
    return result;
  }

  isPayeverDomain(url: string): boolean {
    let result: boolean = false;
    if (this.configService.getConfig()) {
      const config: EnvironmentConfigInterface = this.configService.getConfig();
      let domainsArr: string[] = [];
      for (const value of values(config)) {
        const domainsValues: string[] = values(value).map(a => this.getUrlHostname(a));
        domainsArr = domainsArr.concat(domainsValues);
      }
      result = this.getUrlHostname(url) && domainsArr.indexOf(this.getUrlHostname(url)) >= 0;
    }
    return result;
  }

  isCommerceosDomain(url: string): boolean {
    let result: boolean = false;
    if (this.configService.getConfig()) {
      const config: EnvironmentConfigInterface = this.configService.getConfig();
      result = this.getUrlHostname(url) === this.getUrlHostname(config.frontend.commerceos);
    }
    return result;
  }

  asyncRefreshAccessToken(): Observable<LoginResponse> {
    if (!this.configService.getConfig()) {
      return of(null);
    }
    if (!this.refreshToken) {
      return of(null);
    }
    const backendConfig: NodeJsBackendConfigInterface = this.configService.getConfig().backend;
    return this.http.get(`${backendConfig.auth}/api/refresh`, this.createRefreshHeader()).pipe(
      catchError((err: any) => {
        return this.logout().pipe(take(1), delay(10000), map(() => null));
      }),
      map((resp: any) => <LoginResponse>resp),
      flatMap((res: LoginResponse) => {
        return this.setToken(res.accessToken).pipe(map(() => res));
      }),
      flatMap((res: LoginResponse) => {
        // Backward compatibility if API returns only one token
        if (!res.refreshToken) {
          return of(res);
        }
        return this.setRefreshToken(res.refreshToken).pipe(map(() => res));
      }),
    );
  }

  // Quick fix for new roles backend logic
  refreshAccessToken$(reason: string = null): Observable<any> {
    this._refreshAccessToken();
    return this.refreshingToken$.pipe(
      filter(refreshing => !refreshing),
    );
  }

  decodeTokenUser(token: any): any {
    const decodedToken: any = (this.jwtHelper.decodeToken(token) || {});
    const userRaw: any = decodedToken.user;
    let user: any = null;
    try {
      // Sometimes can be packed, sometimes not
      user = jsonpack.unpack(userRaw);
    } catch (e) {
      user = userRaw;
    }
    return user || {};
  }

  /**
   * @deprecated
   * Hard to understand what this method does because of changes made in NK-1208.
   * So better to carefully rewrite logic.
   */
  redirectToEntryPage(route: string, currentRoute: string): void {
    const commerseOsUrl: string = this.configService.getConfig().frontend.commerceos;
    const currentUrl: string = window.location.href;
    let isInsideCommerseOs: boolean = window.location.origin === commerseOsUrl;

    // TODO What is going on here and why? Need a detailed commend, code looks strange. Was added in NK-1208
    const microApps: MicroAppInterface[] = (this.microRegistry.getMicroConfig() || []) as MicroAppInterface[];
    microApps.forEach((micro: MicroAppInterface) => {
      const microRegexpStr: string = `business\/([0-9a-fA-F\-]{36})\/${micro.code}|business\/([0-9a-fA-F\-]{36})\/welcome\/${micro.code}`;
      const regexp: RegExp = new RegExp(microRegexpStr, 'g');
      if (regexp.test(window.location.href)) {
        isInsideCommerseOs = false;
      }
    });

    if (!isInsideCommerseOs) {
      window.location.replace(`${commerseOsUrl}/${route}?returnUrl=${encodeURIComponent(currentUrl)}`);
    } else {
      this.router.navigate([route], { queryParams: { returnUrl: currentRoute } });
    }
  }

  redirectToEntryPageWithUrl(route: string, url: string): void {
    const commerseOsUrl: string = this.configService.getConfig().frontend.commerceos;
    window.location.replace(`${commerseOsUrl}/${route}?returnUrl=${encodeURIComponent(url)}`);
  }

  private checkToken(key: string, token: string): void {
    if ((token || '').length > 4096) {
      console.error('Token is too long', key, token.length);
    }
    const customConfig: CustomConfigInterface = this.configService.getConfig().custom;
    if (!this.configService.isDev() && customConfig.proxy === undefined) {
      console.error('Variable "custom.proxy" in "env.json" is not set!', key, (token || '').length);
    }
  }

  private _initTokenData(): void {
    if (this.token) {
      const user: any = this.decodeTokenUser(this.token);
      this._authUserData = {
        uuid: user.id,
        email: user.email,
        first_name: user.first_name,
        last_name: user.last_name,
        roles: user.roles,
        tokenType: user.tokenType
      };
    }
  }

  private _refreshAccessToken(): void {
    if (!this.refreshingAccessToken) {
      this.refreshingAccessToken = true;
      this.platformService.dispatchEvent({
        target: AUTH_EVENT,
        action: AUTH_EVENT_ACTION,
        data: {
          refreshing: true
        }
      });

      this.asyncRefreshAccessToken().pipe(
        take(1)
      ).subscribe(() => {
        this.platformService.dispatchEvent({
          target: AUTH_EVENT,
          action: AUTH_EVENT_ACTION,
          data: {
            refreshing: false
          }
        });
      });
    }
  }

  private createErrorBag(errors: IErrorEntryResponse): any {
    const result: any = {
      errorBag: {},
      raw: errors.error
    };

    switch (errors.error.statusCode) {
      case 401:
        if (['REASON_DISPLAY_CAPTCHA', 'REASON_NO_CAPTCHA'].indexOf(errors.error.reason) >= 0) {
          result.errorBag['email'] = errors.error.message;
        } else {
          result.errorBag['email'] = this.translateService.translate('forms.error.unauthorized.invalid_credentials');
          result.errorBag['plainPassword'] = this.translateService.translate(
            'forms.error.unauthorized.invalid_credentials',
          );
        }
        break;
      case 400:
        const errorList: any = errors.error.errors;
        if (errorList) {
          const errorBag: any = result.errorBag;
          if (errorList instanceof Array) {
            errorList.forEach((paramError: any) => {
              const errorText: string = Object.keys(paramError.constraints)
                .reduce((res, key) => res += paramError.constraints[key], '');

              errorBag[paramError.property] = this.translateService.translate(errorText);
            });
          } else {
            Object.keys(errorList).forEach(key => {
              const keyVal: any = errorList[key];
              if (keyVal && keyVal.message) {
                errorBag[key] = keyVal.message;
              }
            });
          }
        }
        break;
      default:
    }

    if (errors.error.message) {
      result['message'] = errors.error.message;
    }

    return result;
  }

  private createAnonymHeader(header?: any): { headers: { [headers: string]: string } } {
    const result: { [headers: string]: string } = {};
    // This header will be processed in interceptor
    result[AuthHeadersEnum.anonym] = 'true';
    return {
      ...(header || {}),
      headers: result
    };
  }

  private createRefreshHeader(header?: any): { headers: { [headers: string]: string } } {
    const result: { [headers: string]: string } = {};
    // This header will be processed in interceptor
    result[AuthHeadersEnum.refresh] = 'true';
    return {
      ...(header || {}),
      headers: result
    };
  }

  private getUrlHostname(url: string): string {
    const elem: HTMLAnchorElement = document.createElement('a');
    elem.href = url;
    return elem.hostname;
  }

}
