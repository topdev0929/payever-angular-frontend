import { HttpClient, HttpErrorResponse, HttpRequest } from '@angular/common/http';
import { Injectable, Injector } from '@angular/core';
import { Router } from '@angular/router';
import { JwtHelperService } from '@auth0/angular-jwt';
import jsonpack from 'jsonpack';
import { forEach } from 'lodash-es';
import { BehaviorSubject, combineLatest, Observable, of, Subject, throwError } from 'rxjs';
import {
  catchError, mergeMap, filter,
  distinctUntilChanged, map, startWith, take, mapTo, tap,
} from 'rxjs/operators';

import {
  PE_ENV,
  EnvironmentConfigInterface,
  NodeJsBackendConfigInterface,
  CustomConfigInterface,
} from '@pe/common';
import { TranslateService } from '@pe/i18n';

import {
  AUTH_EVENT,
  ACCESS_TOKEN_NAME,
  REFRESH_TOKEN_NAME,
  GUEST_TOKEN_NAME,
  IS_2FA_JUST_PASSED,
  V4IP,
  AUTH_EVENT_ACTION,
  IS_SECURITY_QUESTION_DEFINED,
} from '../constants';
import { AccountTypeEnum, AuthTokenType, AuthHeadersEnum } from '../enums';
import {
  AuthUserData,
  LoginPayload,
  LoginResponse,
  RegisterPayload,
  RegisterResponse,
  ExtraLoginData,
  AuthTokenPayload,
  SetTokensInterface,
  IErrorEntryResponse,
  CreateUserAccountConfigInterface,
  SecurityQuestionInterface,
  SecurityQuestionPayloadInterface,
} from '../interfaces';

// Long paths are here to avoid circular dependencies

import { AuthServiceInterface } from './auth.service.interface';
import { AuthPlatformService, PlatformEventInterface } from './platform.service';

@Injectable({ providedIn: 'root' })
export class PeAuthService implements AuthServiceInterface {
  readonly jwtHelper: JwtHelperService;
  readonly onChange$: Observable<void>;

  private errorSubject = new BehaviorSubject<string>(null);
  private _authUserData: AuthUserData = null;
  private refreshingAccessToken = false;
  private refreshingToken$: Observable<boolean> = this.platformService.observe$.pipe(
    filter((event: PlatformEventInterface) => event.target === AUTH_EVENT),
    map((event: PlatformEventInterface) => event.data.refreshing),
    startWith(false),
    distinctUntilChanged(),
  );

  // need to handle error in commerceos apm
  public error$ = this.errorSubject.asObservable();

  constructor(
    private http: HttpClient,
    private translateService: TranslateService,
    private router: Router,
    private platformService: AuthPlatformService,
    private injector: Injector,
  ) {
    this.jwtHelper = new JwtHelperService();
    this.onChange$ = this.onChangeSubject.asObservable();

    if (this.isDev() && (!this.token || !this.refreshToken)) {
      console.warn(
        `Don't forget to set auth values "${ACCESS_TOKEN_NAME}" and "${REFRESH_TOKEN_NAME}" to tokens for development`,
      );
    }

    // Make to all service instances know we are refreshing token already
    this.refreshingToken$.subscribe(refreshing => this.refreshingAccessToken = refreshing);
  }

  private get env(): EnvironmentConfigInterface {
    // Can't get via constructor because not initialed sometimes yet on create
    const env = this.injector.get(PE_ENV);
    if (!env) {
      console.error('Empty env in auth!');
    }

    return env;
  }

  private get onChangeSubject(): Subject<void> {
    // TODO Find better solution for case when we have multiple instances of AuthService
    if (!window['pe_auth_service_on_change_subj']) {
      window['pe_auth_service_on_change_subj'] = new Subject<void>();
    }

    return window['pe_auth_service_on_change_subj'];
  }

  get token(): string {
    // TODO Remove getting from localStorage that is left for back compatibility
    return this.localStorageGet(ACCESS_TOKEN_NAME, this.localStorageGet(ACCESS_TOKEN_NAME, ''));
  }

  get guestToken(): string {
    // It's better than activated route, because activated route doesn't reflect current url sometimes
    const urlParams = this.getUrlParams();

    return this.localStorageGet(GUEST_TOKEN_NAME, urlParams['guest_token']) || '';
  }

  get refreshToken(): string {
    // TODO Remove getting from localStorage that is left for back compatibility
    return this.localStorageGet(REFRESH_TOKEN_NAME, this.localStorageGet(REFRESH_TOKEN_NAME, ''));
  }

  /**
   * @deprecated Please use preferredCheckoutToken instead
   */
  get prefferedCheckoutToken(): string {
    return this.preferredCheckoutToken;
  }

  get preferredCheckoutToken(): string {
    if (window.location.hostname === this.env.frontend.commerceos.split('://')[1]) {
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
      this.localStorageSet('pe_active_business', JSON.stringify(data.activeBusiness));
      this.localStorageSet('pe_user_email', this.getUserData().email || data.email);
    }
  }

  get refreshLoginData(): ExtraLoginData {
    return {
      activeBusiness: JSON.parse(this.localStorageGet('pe_active_business')),
      email: this.localStorageGet('pe_user_email'),
    };
  }

  get guestTokenQueryParam(): { guest_token: string } | null {
    return !this.isLocalStorageEnabled() && this.guestToken ? { guest_token: this.guestToken } : null;
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
      return this.asyncRefreshAccessToken().pipe(
        map(() => {
          window[IS_2FA_JUST_PASSED] = false;

          return true;
        }),
      );
    } else {
      return of(false);
    }
  }

  isSecurityQuestionDefined(): boolean {
    const value = this.localStorageGet(IS_SECURITY_QUESTION_DEFINED, false);

    return value === true || value === 'true';
  }

  resetSecurityQuestionDefined(): void {
    this.localStorageSet(IS_SECURITY_QUESTION_DEFINED, false);
  }

  isSecondFactorJustPassed(): boolean {
    // This flag is resetted on page refresh. We need it for transactions edit.
    return !!window[IS_2FA_JUST_PASSED];
  }

  setTokens(tokens: SetTokensInterface): Observable<null> {
    return combineLatest([
      tokens.accessToken !== undefined ? this.setToken(tokens.accessToken) : of(null),
      tokens.refreshToken !== undefined ? this.setRefreshToken(tokens.refreshToken) : of(null),
    ]).pipe(mapTo(null));
  }

  clearSession(): Observable<void> {
    return this.setTokens({ accessToken: '', refreshToken: '' });
  }

  setToken(token: string): Observable<boolean> {
    this.checkToken(ACCESS_TOKEN_NAME, token);
    this.localStorageSet(ACCESS_TOKEN_NAME, token);

    return of(!!token);
  }


  setRefreshToken(token: string): Observable<boolean> {
    this.checkToken(REFRESH_TOKEN_NAME, token);
    this.localStorageSet(REFRESH_TOKEN_NAME, token);

    return of(true);
  }

  login(data: LoginPayload): Observable<string> {
    const backendConfig: NodeJsBackendConfigInterface = this.env.backend;
    const url = `${backendConfig.auth}/api/login`;

    return this.loginRequest(url, data).pipe(
      map((res: LoginResponse) => res?.accessToken),
    );
  }

  loginRequest(url: string, data: LoginPayload) {
    return this.http.post<LoginResponse>(url, data, this.createAnonymHeader()).pipe(
      catchError((errors: IErrorEntryResponse) => {
        return throwError(this.createErrorBag(errors));
      }),
      map((resp: any) => <any>resp), // some issue in type defs
      mergeMap((res: LoginResponse) => {
        if (res?.accessToken) {
          return this.setToken(res.accessToken).pipe(map(() => res));
        } else {
          // we have 2FA
          this.localStorageSet(IS_SECURITY_QUESTION_DEFINED, res?.isSecurityQuestionDefined ?? false);

          return of(res);
        }
      }),
      mergeMap((res: LoginResponse) => {
        if (res?.refreshToken) {
          return this.setRefreshToken(res.refreshToken).pipe(map(() => res));
        } else {
          return of(res);
        }
      }),
      tap(() => this.onChangeSubject.next()),
    );
  }

  loginEmployeeInBusiness(data: LoginPayload, businessId: string): Observable<LoginResponse> {
    const backendConfig: NodeJsBackendConfigInterface = this.env.backend;
    const url = `${backendConfig.auth}/api/login/employee/${businessId}`;

    return this.loginRequest(url, data);
  }

  logout(): Observable<void> {
    this._authUserData = null;

    return this.setToken('').pipe(
      mergeMap(() => {
        if (this.isDev()) {
          this.clearDevAuthToken();
        }

        return this.setRefreshToken('');
      }),
      map(() => {
        if (this.isDev()) {
          this.clearDevRefreshToken();
        }
        this._authUserData = null;
        this.router.onSameUrlNavigation = 'reload';
        this.router.navigate(['/']);

        return null;
      }),
      tap(() => this.onChangeSubject.next()),
    );
  }

  /**
   * to set auth_token document token
   */
  clearDevAuthToken(): void {
    document.cookie = `${ACCESS_TOKEN_NAME}=;path=/`;
  }

  /**
   * to set refresh_token document token
   */
  clearDevRefreshToken(): void {
    document.cookie = `${REFRESH_TOKEN_NAME}=;path=/`;
  }

  register(
    data: RegisterPayload,
    config: CreateUserAccountConfigInterface = null,
    accountType: AccountTypeEnum = null,
  ): Observable<string> {
    const backendConfig: NodeJsBackendConfigInterface = this.env.backend;
    const url = accountType ? `${backendConfig.auth}/api/${accountType}/register` : `${backendConfig.auth}/api/register`;

    return this.registrationRequest(url, data).pipe(
      mergeMap((res: LoginResponse) => {
        return config ? this.http.post<void>(`${backendConfig.users}/api/user`, config).pipe(map(() => res)) : of(res);
      }),
      map((tokens: RegisterResponse) => tokens.accessToken),
    );
  }

  registrationRequest(url, data): Observable<LoginResponse> {
    return this.http.post<RegisterResponse>(url, data).pipe(
      catchError((errors: IErrorEntryResponse) => {
        throw this.createErrorBag(errors);
      }),
      mergeMap((res: LoginResponse) => {
        return this.setToken(res.accessToken).pipe(map(() => res));
      }),
    );
  }

  registerEmployeeInBusiness(
    data: RegisterPayload,
    businessId: string,
  ): Observable<LoginResponse> {
    const url = `${this.env.backend.auth}/api/employee/register/${businessId}`;

    return this.registrationRequest(url, data);
  }

  navigateToUrl(url: string) {
    this.router.navigate([url]);
  }

  secondFactorCode(code: string): Observable<string> {
    const backendConfig: NodeJsBackendConfigInterface = this.env.backend;

    return this.http
      .post<RegisterResponse>(
        `${backendConfig.auth}/api/2fa/auth`,
        { secondFactorCode: code },
        this.createRefreshHeader(),
      )
      .pipe(
        catchError((errors: IErrorEntryResponse) => {
          this.errorSubject.next(`PeAuthService api/2fa/auth:\n${JSON.stringify(errors)}\ntoken:${this.token}\nrefreshToken:${this.refreshToken}`);

          return throwError(this.createErrorBag(errors));
        }),
        mergeMap((res: LoginResponse) => {
          if (!res?.accessToken) {
            return of(res);
          }

          return this.setToken(res.accessToken).pipe(map(() => res));
        }),
        mergeMap((res: LoginResponse) => {
          if (!res?.refreshToken) {
            return of(res);
          }

          return this.setRefreshToken(res.refreshToken).pipe(map(() => res));
        }),
        map((tokens: RegisterResponse) => {
          if (tokens?.accessToken) {
            window[IS_2FA_JUST_PASSED] = true;

            return tokens.accessToken;
          }

          return null;
        }),
      );
  }

  repeatSendCode(): Observable<RegisterResponse> {
    const backendConfig: NodeJsBackendConfigInterface = this.env.backend;

    return this.http
      .post<RegisterResponse>(`${backendConfig.auth}/api/2fa/resend`, {}, this.createRefreshHeader())
      .pipe(
        catchError((errors: HttpErrorResponse) => {
          if (errors.status === 401) {
            return this.logout().pipe(tap(() => window.location.reload()));
          }

          return throwError(this.createErrorBag(errors));
        }),
        map(() => undefined),
      );
  }

  userSecurityQuestion(): Observable<SecurityQuestionInterface> {
    const backendConfig: NodeJsBackendConfigInterface = this.env.backend;

    return this.http
      .get<SecurityQuestionInterface>(`${backendConfig.auth}/api/security-question/question`)
      .pipe(
        catchError((errors: HttpErrorResponse) => {
          return throwError(this.createErrorBag(errors));
        }),
      );
  }

  validateSecurityQuestion(payload: SecurityQuestionPayloadInterface): Observable<RegisterResponse> {
    const backendConfig: NodeJsBackendConfigInterface = this.env.backend;

    return this.http
      .post<RegisterResponse>(
        `${backendConfig.auth}/api/security-question/validate`,
        payload,
        this.createRefreshHeader(),
      )
      .pipe(
        catchError((errors: IErrorEntryResponse) => {
          this.errorSubject.next(`PeAuthService api/security-question/validate:\n${JSON.stringify(errors)}\ntoken:${this.token}\nrefreshToken:${this.refreshToken}`);

          return throwError(this.createErrorBag(errors));
        }),
        mergeMap((res: LoginResponse) => {
          if (!res?.accessToken) {
            return of(res);
          }

          return this.setToken(res.accessToken).pipe(map(() => res));
        }),
        mergeMap((res: LoginResponse) => {
          if (!res?.refreshToken) {
            return of(res);
          }

          return this.setRefreshToken(res.refreshToken).pipe(map(() => res));
        }),
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
    let result = false;
    if (this.env) {
      const backends: string[] = [
        this.env.backend.payments,
        this.env.backend.connect,
        this.env.backend.billingSubscription,
        this.env.backend.paymentNotifications,
        this.env.thirdParty.payments,
      ].map(a => this.getUrlHostname(a));
      result = backends.indexOf(this.getUrlHostname(url)) >= 0;
    }

    return result;
  }

  isPayeverBackend(url: string): boolean {
    let result = false;
    if (this.env) {
      const backends: string[] = [
        ...Object.values(this.env.backend || {}),
        ...Object.values(this.env.connect || {}),
        ...Object.values(this.env.thirdParty || {}),
        ...Object.values(this.env.payments || {}),
      ].map((a: string) => this.getUrlHostname(a));
      result = backends.indexOf(this.getUrlHostname(url)) >= 0;
    }

    return result;
  }

  isPayeverDomain(url: string): boolean {
    let result = false;
    if (this.env) {
      const config: EnvironmentConfigInterface = this.env;
      let domainsArr: string[] = [];
      for (const value of Object.values(config)) {
        const domainsValues: string[] = Object.values(value).map((a: string) => this.getUrlHostname(a));
        domainsArr = domainsArr.concat(domainsValues);
      }
      result = this.getUrlHostname(url) && domainsArr.indexOf(this.getUrlHostname(url)) >= 0;
    }

    return result;
  }

  isCommerceosDomain(url: string): boolean {
    let result = false;
    if (this.env) {
      const config: EnvironmentConfigInterface = this.env;
      result = this.getUrlHostname(url) === this.getUrlHostname(config.frontend.commerceos);
    }

    return result;
  }

  asyncRefreshAccessToken(): Observable<LoginResponse> {
    if (!this.env) {
      return of(null);
    }
    const backendConfig: NodeJsBackendConfigInterface = this.env.backend;

    return this.http.get(`${backendConfig.auth}/api/refresh`, this.createRefreshHeader()).pipe(
      catchError((err: any) => {
        if ((err.status === 403 || err.status === 401) && this.getUserData().tokenType !== AuthTokenType.default) {
          return this.repeatSendCode().pipe(
            tap(() => {
              this.navigateToUrl('/second-factor-code');
            })
          );
        } else {
          return this.logout().pipe(
            take(1),
            map(() => null),
          );
        }
      }),
      map((resp: any) => <LoginResponse>resp),
      mergeMap((res: LoginResponse) => {
        if (!res?.accessToken) {
          return of(res);
        }

        return this.setToken(res.accessToken).pipe(map(() => res));
      }),
      mergeMap((res: LoginResponse) => {
        // Backward compatibility if API returns only one token
        if (!res?.refreshToken) {
          return of(res);
        }

        return this.setRefreshToken(res.refreshToken).pipe(map(() => res));
      }),
    );
  }

  // Quick fix for new roles backend logic
  refreshAccessToken$(reason: string = null): Observable<any> {
    this._refreshAccessToken();

    return this.refreshingToken$.pipe(filter(refreshing => !refreshing));
  }

  decodeTokenUser(token: any): any {
    const decodedToken: any = this.jwtHelper.decodeToken(token) || {};
    const userRaw: any = decodedToken.user;
    let user: any;
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
    const commerseOsUrl: string = this.env.frontend.commerceos;
    const currentUrl: string = window.location.href;
    let isInsideCommerseOs: boolean = window.location.origin === commerseOsUrl;

    // TODO What is going on here and why? Need a detailed commend, code looks strange. Was added in NK-1208
    // const microApps: any[] = (this.microRegistry.getMicroConfig() || []) as any[];
    // microApps.forEach((micro: any) => {
    //   const microRegexpStr: string = `business\/([0-9a-fA-F\-]{36})\/${micro.code}|business\/([0-9a-fA-F\-]{36})\/welcome\/${micro.code}`;
    //   const regexp: RegExp = new RegExp(microRegexpStr, 'g');
    //   if (regexp.test(window.location.href)) {
    //     isInsideCommerseOs = false;
    //   }
    // });

    if (!isInsideCommerseOs) {
      window.location.href = `${commerseOsUrl}/${route}?returnUrl=${encodeURIComponent(currentUrl)}`;
    } else {
      this.router.navigate([route], { queryParams: { returnUrl: currentRoute } });
    }
  }

  redirectToEntryPageWithUrl(route: string, url: string): void {
    const commerseOsUrl: string = this.env.frontend.commerceos;
    window.location.href = `${commerseOsUrl}/${route}?returnUrl=${encodeURIComponent(url)}`;
  }

  isDev(): boolean {
    return window?.location?.hostname === 'localhost' || V4IP.test(location.hostname);
  }

  private checkToken(key: string, token: string): void {
    if ((token || '').length > 4096) {
      console.error('Token is too long', key, token.length);
    }
    const customConfig: CustomConfigInterface = this.env.custom;
    if (!this.isDev() && customConfig.proxy === undefined) {
      console.error('Variable "custom.proxy" in "env.json" is not set!', key, (token || '').length);
    }
  }

  private _initTokenData(): void {
    if (this.token) {
      const user: any = this.decodeTokenUser(this.token);
      this._authUserData = {
        uuid: user.id,
        email: user.email,
        first_name: user.firstName,
        last_name: user.lastName,
        roles: user.roles,
        tokenType: user.tokenType,
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
          refreshing: true,
        },
      });

      this.asyncRefreshAccessToken()
        .pipe(take(1))
        .subscribe(() => {
          this.platformService.dispatchEvent({
            target: AUTH_EVENT,
            action: AUTH_EVENT_ACTION,
            data: {
              refreshing: false,
            },
          });
        });
    }
  }

  private createErrorBag(errors: IErrorEntryResponse): any {
    const result: any = {
      errorBag: {},
      raw: errors.error,
    };

    switch (errors.error.statusCode) {
      case 401: {
        if (errors.error?.message
          && ['REASON_EMAIL_BAN_LOGIN', 'REASON_EMAIL_BAN_REGISTER'].indexOf(errors.error.message) >= 0
        ) {
          result.errorBag['email'] = this.translateService.translate(`forms.login.error_reasons.${errors.error.message}`);
        } else if (['REASON_DISPLAY_CAPTCHA', 'REASON_NO_CAPTCHA'].indexOf(errors.error.reason) >= 0) {
          result.errorBag['email'] = errors.error.message;
        } else {
          result.errorBag['email'] = this.translateService.translate('forms.error.unauthorized.invalid_credentials');
          result.errorBag['plainPassword'] = this.translateService.translate(
            'forms.error.unauthorized.invalid_credentials',
          );
        }
        break;
      }
      case 400: {
        const errorList: any = errors.error.errors;
        if (errorList) {
          const errorBag: any = result.errorBag;
          if (errorList instanceof Array) {
            errorList.forEach((paramError: any) => {
              const errorText: string = Object.keys(paramError.constraints).reduce(
                (res, key) => res += paramError.constraints[key],
                '',
              );

              errorBag[paramError.property] = this.translateService.translate(errorText);
            });
          } else {
            Object.keys(errorList).forEach((key) => {
              const keyVal: any = errorList[key];
              if (keyVal?.message) {
                errorBag[key] = keyVal.message;
              }
            });
          }
        }
        break;
      }
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
      ...header || {},
      headers: result,
    };
  }

  private createRefreshHeader(header?: any): { headers: { [headers: string]: string } } {
    const result: { [headers: string]: string } = {};
    // This header will be processed in interceptor
    result[AuthHeadersEnum.refresh] = 'true';

    return {
      ...header || {},
      headers: result,
    };
  }

  private getUrlHostname(url: string): string {
    const elem: HTMLAnchorElement = document.createElement('a');
    elem.href = url;

    return elem.hostname;
  }

  private getUrlParams(): {} {
    const params = {};
    let search = decodeURIComponent(window.location.href.slice( window.location.href.indexOf( '?' ) + 1 ));
    if (search.indexOf('#') >= 0) {
      search = search.slice(0, search.indexOf('#'));
    }
    const definitions = search.split('&');

    forEach(definitions, (val) => {
      const parts = val.split('=', 2);
      params[parts[0]] = parts[1];
    });

    return params;
  }

  private isLocalStorageEnabled(): boolean {
    try {
      localStorage?.getItem('_');

      return true;
    } catch (e) {}

    return false;
  }

  private localStorageGet(key: string, def: any = null): any {
    let result = window[`pe_auth_localStorage_${key}`];
    try {
      result = localStorage.getItem(key);
    } catch (e) {}

    return result || def;
  }

  private localStorageSet(key: string, value: any): void {
    try {
      window[`pe_auth_localStorage_${key}`] = value;
      if (localStorage) {
        localStorage.setItem(key, value);
      }
    } catch (e) {}
  }

  private localStorageRemove(key: string): void {
    try {
      delete window[`pe_auth_localStorage_${key}`];
      if (localStorage) {
        localStorage.removeItem(key);
      }
    } catch (e) {}
  }

  setApm(token, message: string) {
    const info = JSON.stringify({
      token,
      storageToken: this.token,
      storageRefreshToken: this.refreshToken,
    });
    this.errorSubject.next(`${message}:\n${info}`);
  }

  setTokenHeader(req: HttpRequest<any>, token: string): HttpRequest<any> {
    if (!token || token.trim() === '') {
      console.error('Attempt to set empty bearer token', token);
    }

    return req.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`,
      },
    });
  }
}
