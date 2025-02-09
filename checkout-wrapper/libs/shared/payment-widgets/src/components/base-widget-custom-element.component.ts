import { registerLocaleData } from '@angular/common';
import {
  Injector,
  Input,
  Directive,
  Output,
  EventEmitter,
  ChangeDetectorRef,
  OnDestroy,
  ElementRef,
} from '@angular/core';
import { BehaviorSubject, combineLatest, from, Observable, ReplaySubject } from 'rxjs';
import { first, map, takeUntil, tap } from 'rxjs/operators';

import {
  PaymentItem,
  PaymentMethodEnum,
  WidgetConfigInterface,
  WidgetTypeEnum,
} from '@pe/checkout/types';
import { LocaleConstantsService } from '@pe/checkout/utils';
import { EnvironmentConfigInterface as EnvInterface } from '@pe/common';

import { LOCALE_MAPPER } from '../../../../../apps/environments/locales';

@Directive()
export abstract class BaseWidgetCustomElementComponent implements OnDestroy {

  amount: number = null;
  @Input('amount') set setAmount(amount: any) {
    this.amount = this.parseInputNumber(amount);
  }

  channelSet: string = null;
  @Input('channelset') set setChannelSet(channelSet: any) {
    this.channelSet = this.parseInputString(channelSet);
  }

  type: string = null;
  @Input('type') set setWidgetType(type: any) {
    this.type = this.parseInputString(type);
  }

  env: EnvInterface = null;
  @Input('env') set setEnv(env: any) {
    this.env = this.parseInputObject(env);
  }

  config: WidgetConfigInterface = null;
  @Input('config') set setInitialValues(config: any) {
    this.config = this.parseInputObject(config);
  }

  isDebugMode = false;
  @Input('isdebugmode') set setIsDebugMode(isDebugMode: any) {
    this.isDebugMode = this.parseInputBoolean(isDebugMode);
  }

  paymentMethod: PaymentMethodEnum = null;
  @Input('paymentMethod') set setPaymentMethod(paymentMethod: any) {
    this.paymentMethod = this.parseInputString(paymentMethod) as PaymentMethodEnum;
  }

  theme: 'light' | 'dark' = null;
  @Input('theme') set setTheme(theme: 'light' | 'dark') {
    const prefersColor = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'light' : 'dark';
    const value = theme
      ? this.parseInputString(theme) as 'light' | 'dark'
      : prefersColor;

    this.theme = value;
  }

  @Input() cart: PaymentItem[];

  @Input() shadowRoot: ShadowRoot;

  @Output() clicked: EventEmitter<void> = new EventEmitter();

  isReady$ = new BehaviorSubject<boolean>(false);
  WidgetTypeEnum: typeof WidgetTypeEnum = WidgetTypeEnum;
  cdr: ChangeDetectorRef = this.injector.get(ChangeDetectorRef);

  protected destroyed$: ReplaySubject<boolean> = new ReplaySubject();

  protected localeConstantsService = this.injector.get(LocaleConstantsService);

  private isForceHideSubject$ = new BehaviorSubject<boolean>(false);

  constructor(
    public element: ElementRef,
    protected injector: Injector,
    ) {
    combineLatest([
      this.isForceHideSubject$,
      this.registerLocale(),
    ]).pipe(
      tap(([isForceHide, localeLoaded]) => this.isReady$.next(!isForceHide && localeLoaded)),
      takeUntil(this.destroyed$),
    ).subscribe();
  }

  ngOnDestroy(): void {
    this.destroyed$.next(true);
    this.destroyed$.complete();
  }

  onClicked(): void {
    this.clicked.emit();
  }

  onFailed(): void {
    if (!this.isDebugMode) {
      this.isForceHideSubject$.next(true);
    }
  }

  protected parseInputObject(data: string): any {
    let result: any = data;
    try {
      result = JSON.parse(data);
    } catch (e) {}

    return result;
  }

  protected parseInputBoolean(data: any): boolean {
    return data === true || data === 'true';
  }

  protected parseInputNumber(data: any): number {
    return parseFloat(data);
  }

  protected parseInputString(data: string): string {
    let result: string = data;
    try {
      // TODO: check if this is required
      result = JSON.parse(data);
    } catch (e) { }

    return String(result);
  }

  private importLocale(): Observable<unknown> {
    const locale = this.localeConstantsService.getLang();

    return from(LOCALE_MAPPER[locale]?.() ?? import('@angular/common/locales/en')).pipe(
      map(locale => locale.default),
    );
  }

  protected registerLocale(): Observable<boolean> {
    return this.importLocale().pipe(
      first(),
      tap((l: any) => {
        registerLocaleData(l, l[0] === 'nb' ? 'no' : l[0]);
      }),
      map(() => true),
    );
  }
}
