import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  EventEmitter,
  OnDestroy,
  OnInit,
  Output,
  ViewChild,
} from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { SelectSnapshot } from '@ngxs-labs/select-snapshot';
import { Store } from '@ngxs/store';
import { merge, of, Subject } from 'rxjs';
import { catchError, filter, map, scan, startWith, switchMap, takeUntil, tap } from 'rxjs/operators';

import { ANALYTICS_FORM_SETTINGS, AnalyticsFormService } from '@pe/checkout/analytics';
import { SaveProgressHelperService } from '@pe/checkout/core';
import { emailRequiredValidator } from '@pe/checkout/forms/email';
import { AddressStorageService } from '@pe/checkout/storage';
import { FlowState } from '@pe/checkout/store';
import { FlowInterface } from '@pe/checkout/types';
import { CustomElementService } from '@pe/checkout/utils';
import { PeDestroyService } from '@pe/destroy';

import { UserInterface, UserService } from '../../services';

enum Action {
  Login = 'login',
  ForgotPassword = 'forgotPassword',
}

interface ActionInterface {
  action: Action;
  callback?: () => void ;
}

interface ViewModel {
  message: string;
  loading: boolean;
}

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'checkout-main-user-login-form',
  templateUrl: 'user-login-form.component.html',
  styleUrls: ['./user-login-form.component.scss'],
  providers: [
    PeDestroyService,
    {
      provide: ANALYTICS_FORM_SETTINGS,
      useValue: {
        formName: 'FORM_USER_LOGIN',
      },
    },
  ],
})
export class UserLoginFormComponent implements OnInit, OnDestroy {

  @SelectSnapshot(FlowState.flow) private flow: FlowInterface;

  @Output() toGuest: EventEmitter<boolean> = new EventEmitter<boolean>();
  @Output() continue: EventEmitter<void> = new EventEmitter<void>();

  @ViewChild('addressInput', { static: false }) addressInput: ElementRef;

  get flowId(): string {
    return this.flow?.id;
  }

  public formGroup = this.fb.group({
    email: [
      this.addressHelperService.getTemporaryAddress(this.flowId)?.email || '',
      [emailRequiredValidator],
    ],
    password: [null, Validators.required],
  });

  private actionsSubject$ = new Subject<ActionInterface>();
  private messageSubject$ = new Subject<string>();
  private loadingSubject$ = new Subject<boolean>();

  public vm$ = merge(
    this.messageSubject$.pipe(
      map(message => ({ message })),
    ),
    merge(
      this.loadingSubject$,
      this.messageSubject$.pipe(
        map(() => false),
      ),
    ).pipe(
      map(loading => ({ loading })),
    ),
  ).pipe(
    startWith({ message: null, loading: false }),
    scan((acc, curr) => ({ ...acc, ...curr }), {} as ViewModel),
  );

  constructor(
    protected customElementService: CustomElementService,
    private fb: FormBuilder,
    private addressHelperService: AddressStorageService,
    private userService: UserService,
    private saveProgressHelperService: SaveProgressHelperService,
    private analyticsFormService: AnalyticsFormService,
    private destroy$: PeDestroyService,
    private store: Store,
  ) {}

  ngOnInit(): void {
    (window as any).PayeverStatic?.SvgIconsLoader?.loadIcons(
      ['trashcan-16'],
      null,
      this.customElementService.shadowRoot
    );

    const actions$ = this.actionsSubject$.pipe(
      switchMap(({ action, callback }) => {
        const { email, password } = this.formGroup.value;
        this.loadingSubject$.next(true);

        switch (action) {
          case Action.Login:
            return this.userService.userLogin(email, password, this.flowId).pipe(
              tap((user) => {
                this.onLoginSuccess(user);
                callback?.();
              }),
              catchError(() => {
                this.messageSubject$.next($localize `:@@user.error.bad_login_or_password:`);

                return of(null);
              }),
            );
          case Action.ForgotPassword:
            return this.userService.resetPassword(email).pipe(
              tap(value => this.messageSubject$.next(value)),
            );
          default:
            this.loadingSubject$.next(false);
            throw new Error('Unknown user login action');
        }
      }),
      tap(() => this.loadingSubject$.next(false)),
    );

    this.saveProgressHelperService.editting[this.flowId] = true;

    const saveProgress$ = this.saveProgressHelperService.trigger$.pipe(
      filter(data => data.flowId === this.flowId),
      tap(({ callback: saveProgressCallback }) => this.actionsSubject$.next({
          action: Action.Login,
          callback: () => {
            const flow = this.store.selectSnapshot(FlowState.flow);
            saveProgressCallback({ flow, openNextStep: false });
          },
        } as ActionInterface)
      ),
    );

    merge(
      saveProgress$,
      actions$,
    ).pipe(
      takeUntil(this.destroy$),
    ).subscribe();
  }

  ngOnDestroy(): void {
    this.saveProgressHelperService.editting[this.flowId] = false;
  }

  public navigateToGuest(): void {
    this.toGuest.emit(true);
  }

  public forgotPassword(): void {
    this.actionsSubject$.next({ action: Action.ForgotPassword });
  }

  public clearMessage(): void {
    this.messageSubject$.next(null);
  }

  public submit(): void {
    this.actionsSubject$.next({ action: Action.Login });
  }

  private onLoginSuccess(user: UserInterface): void {
    if (!user) { return }
    const address = user.shippingAddresses?.[0];
    this.addressHelperService.setTemporaryAddress(this.flowId, {
      email: user.email,
      phone: user.phone,
      salutation: user.salutation,
      firstName: user.firstName,
      lastName: user.lastName,

      country: address ? address.country : null,
      city: address ? address.city : null,
      street: address ? address.street : null,
      apartment: address ? address.apartment : null,
      zipCode: address ? address.zipCode : null,
    });
    this.continue.emit();
  }
}
