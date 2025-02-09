import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  HostListener,
  Input,
  OnDestroy,
  OnInit,
  Output,
  ViewEncapsulation,
} from '@angular/core';
import { FormBuilder, FormControl, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { BehaviorSubject, EMPTY, Subject } from 'rxjs';
import { switchMap, take, takeUntil, tap } from 'rxjs/operators';

import { AuthTokenPayload, PeAuthService } from '@pe/auth';
import { CosEnvService, LoaderService } from '@pe/base';
import { BusinessApiService } from '@pe/business';
import { PeDestroyService } from "@pe/common";
import { LoginFormService } from '@pe/entry/login';
import { PlatformService } from '@pe/platform';

const CODE_LENGTH = 6;

@Component({
  selector: 'login-second-factor-code',
  templateUrl: './login-second-factor-code.component.html',
  styleUrls: ['./login-second-factor-code.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
})
export class LoginSecondFactorCodeComponent implements OnInit, OnDestroy {

  public email = '';
  public codeInvalid$: Subject<boolean> = new Subject();
  public isLoading$: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
  public availableSecurityQuestion = this.authService.isSecurityQuestionDefined();
  private returnUrl: string;

  @Input() emitOnSuccessLogin = false;
  @Input() hideLanguageSwitcher = false;
  @Output() successLoginDone: EventEmitter<void> = new EventEmitter<void>();

  public readonly form = this.fb.group({
    code: new FormControl(null, [Validators.required, Validators.minLength(CODE_LENGTH)]),
  });

  constructor(
    private fb: FormBuilder,
    private activatedRoute: ActivatedRoute,
    private platformService: PlatformService,
    private authService: PeAuthService,
    private router: Router,
    private loaderService: LoaderService,
    private apiService: BusinessApiService,
    private loginFormService: LoginFormService,
    private envService: CosEnvService,
    private route: ActivatedRoute,
    private readonly destroy$: PeDestroyService,
  ) {}

  ngOnInit() {
    this.envService.secondFactorAuthPassed = true;
    const payload: AuthTokenPayload = this.authService.getRefershTokenData();
    this.email = this.hideEmail(payload.email || '');
    this.platformService.profileMenuChanged = {
      firstName: payload.firstName,
      lastName: payload.lastName,
    };
    this.returnUrl = this.activatedRoute.snapshot.queryParams['returnUrl'];
    this.loaderService.hideLoader();

    this.form.statusChanges
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => {
        if (this.codeReady) {
          this.onSendCode();
        }
      });
  }

  ngOnDestroy() {
    this.envService.secondFactorAuthPassed = true;
  }

  get code(): string {
    return this.form.get('code').value;
  }

  get codeReady(): boolean {
    return this.form.valid;
  }

  @HostListener('document:keypress', ['$event'])
  handleKeyboardEvent(event: KeyboardEvent) {
    if (event.key === 'Enter') {
      this.onSendCode();
    }
  }

  public onSuccessLogin(): void {
    const { returnUrl, ...passQueryParams } = this.route.snapshot.queryParams;
    const queryParams = Object.keys(passQueryParams).length > 0 ? { queryParams: { ...passQueryParams } } : undefined;

    if (this.emitOnSuccessLogin) {
      this.successLoginDone.emit();
    } else if (returnUrl) {
      const fullUrlRegexp = /^(http(s)?:\/\/.).*/;
      if (fullUrlRegexp.test(this.returnUrl)) {
        // use windows instead of router because we can authenticate from external sites
        window.location.replace(returnUrl);
      } else if (this.returnUrl.includes('second-factor-code')) {
        this.forkForNextSteepAfterIdentification(queryParams);
      } else {
        this.router.navigate([returnUrl], queryParams);
      }
    } else {
      this.forkForNextSteepAfterIdentification(queryParams);
    }
  }

  public isShowSkip(): boolean {
    // This one is only for local development
    return window.location.hostname === 'localhost' && window.location.port === '8888';
  }

  public toSecurityQuestion(): void {
    this.router.navigate(['security-question']);
  }

  public onLogOut() {
    this.authService.logout().pipe(take(1), takeUntil(this.destroy$)).subscribe();
  }

  private onSendCode() {
    if (!this.codeReady) {
      this.codeInvalid$.next(true);
    } else {
      this.codeInvalid$.next(false);
      this.isLoading$.next(true);
      this.onSubmit();
    }
  }

  private onSubmit(): void {
    this.authService.secondFactorCode(this.code).subscribe(
      () => {
        window['pe_isSecondFactorJustPassedAsTemporary'] = true; // TODO Remove this hack after ng-kit update
        this.authService.resetSecurityQuestionDefined();
        this.onSuccessLogin();
      },
      () => {
        this.isLoading$.next(false);
        this.codeInvalid$.next(true);
      },
    );
  }

  private enterToDashboard(businesses) {
    const businessesId = businesses.businesses ? businesses.businesses[0]._id : businesses[0]._id;
    const invitationRedirectUrl = this.route.snapshot.queryParams.invitationRedirectUrl;
    if (invitationRedirectUrl) {
      this.router.navigate([invitationRedirectUrl, businessesId]);
    } else {
      const url = `business/${businessesId}/info/overview`;
      this.router.navigate([url]);
    }
  }

  private forkForNextSteepAfterIdentification(queryParams) {
    this.apiService.getBusinessesList().pipe(
      switchMap((businesses) => {
        if (!businesses?.total) {
          return this.loginFormService.getUserBusiness().pipe(
            tap((businessData) => {
              if (businessData.businesses.length) {
                this.enterToDashboard(businessData.businesses);
              } else {
                this.router.navigate([`/personal/${this.authService.getUserData().uuid}`], queryParams);
              }
            }),
          );
        }

        if (businesses.total === 1) {
          this.enterToDashboard(businesses);

          return EMPTY;
        }

        this.router.navigate(['switcher'], queryParams);

        return EMPTY;
      }),
      takeUntil(this.destroy$),
    ).subscribe();
  }

  private hideEmail(email: string): string {
    if (!email) {
      return email;
    }
    let result: string = email;
    const reg = /(^.{3})(.+)@/g;

    const substr = (reg.exec(email) as Array<string>) || [];
    if (substr && substr.length > 2) {
      result = result.replace(substr[2], '******');
    }

    return result;
  }
}
