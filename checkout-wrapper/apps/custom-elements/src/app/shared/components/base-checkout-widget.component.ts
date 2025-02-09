import {
  ComponentRef,
  Directive,
  EventEmitter,
  Input,
  OnInit,
  Output,
  ViewChild,
  ViewContainerRef,
} from '@angular/core';
import { BehaviorSubject, merge, Observable, ReplaySubject } from 'rxjs';
import { first, map, mergeMap, takeUntil, tap } from 'rxjs/operators';

import { BaseCustomElementWrapperComponent } from '@pe/checkout/elements';
import {
  AddressInterface,
  PaymentItem,
  PaymentWidgetEnum,
  ShippingOption,
  WidgetConfigInterface,
  WidgetTypeEnum,
} from '@pe/checkout/types';
import type { CheckoutWidgetComponent } from '@pe/checkout/web-components/widget';
import { EnvironmentConfigInterface } from '@pe/common/core';

@Directive() // Has to be here to make work @Input in abstract class
export abstract class BaseCheckoutWidgetComponent extends BaseCustomElementWrapperComponent implements OnInit {

  @ViewChild('container', { read: ViewContainerRef, static: true }) containerRef: ViewContainerRef;

  channelSet$ = new BehaviorSubject<string>(null);
  @Input('channelset') set setChannelSet(value: any) {
    this.channelSet$.next(this.parseInputString(value));
  }

  type$ = new BehaviorSubject<WidgetTypeEnum>(null);
  @Input('type') set setType(value: any) {
    this.type$.next(this.parseInputByType<WidgetTypeEnum>(value));
  }

  amount$ = new BehaviorSubject<number>(null);
  @Input('amount') set setAmount(value: any) {
    this.amount$.next(this.parseInputNumber(value));
  }

  isDebugMode$ = new BehaviorSubject<boolean>(false);
  @Input('isdebugmode') set setIsDebugMode(value: any) {
    this.isDebugMode$.next(this.parseInputBoolean(value));
  }

  env$ = new BehaviorSubject<EnvironmentConfigInterface>(null);
  @Input('env') set setEnv(value: any) {
    this.env$.next(this.parseInputObject(value));
  }

  config$ = new BehaviorSubject<WidgetConfigInterface>(null);
  @Input('config') set setConfig(value: any) {
    this.config$.next(this.parseInputObject(value));
  }

  paymentMethod$ = new BehaviorSubject<PaymentWidgetEnum>(null);
  @Input('paymentmethod') set setParams(value: any) {
    this.paymentMethod$.next(this.parseInputByType<PaymentWidgetEnum>(value));
  }

  private readonly cart$ = new ReplaySubject<PaymentItem[]>(1);
  @Input() set cart(value: string) {
    this.cart$.next(this.parseInputObject(value));
  }

  private readonly billingAddress$ = new ReplaySubject<AddressInterface>(1);
  @Input('billingaddress') set billingAddress(value: string) {
    this.billingAddress$.next(this.parseInputObject(value));
  }

  private readonly shippingAddress$ = new ReplaySubject<AddressInterface>(1);
  @Input('shippingaddress') set shippingAddress(value: string) {
    this.shippingAddress$.next(this.parseInputObject(value));
  }

  private readonly shippingOption$ = new ReplaySubject<ShippingOption>(1);
  @Input('shippingoption') set shippingOption(value: string) {
    this.shippingOption$.next(this.parseInputObject(value));
  }

  private readonly theme$ = new ReplaySubject<'light' | 'dark'>(1);
  @Input('theme') set theme(value: 'light' | 'dark') {
    this.theme$.next(this.parseInputObject(value));
  }

  @Output() clicked = new EventEmitter<void>();

  ngOnInit(): void {
    this.init(this.containerRef).pipe(
      takeUntil(this.destroy$),
    ).subscribe();
  }


  protected abstract loadComponent(containerRef: ViewContainerRef): Observable<ComponentRef<CheckoutWidgetComponent>>;

  private init(
    containerRef: ViewContainerRef,
  ): Observable<CheckoutWidgetComponent> {
    return this.loadComponent(containerRef).pipe(
      first(),
      mergeMap(component => this.initComponent(component)),
    );
  }

  private initProps(
    { instance }: ComponentRef<CheckoutWidgetComponent>,
  ): Observable<CheckoutWidgetComponent> {
    return merge(
      this.channelSet$.pipe(tap(value => instance.channelSet = value)),
      this.type$.pipe(tap(value => instance.type = value)),
      this.amount$.pipe(tap(value => instance.amount = value)),
      this.isDebugMode$.pipe(tap(value => instance.isDebugMode = value)),
      this.env$.pipe(tap(value => instance.env = value)),
      this.config$.pipe(tap(value => instance.config = value)),
      this.paymentMethod$.pipe(tap(value => instance.paymentMethod = value)),
      this.cart$.pipe(tap(value => instance.cart = value)),
      this.billingAddress$.pipe(tap(value => instance.billingAddress = value)),
      this.shippingAddress$.pipe(tap(value => instance.shippingAddress = value)),
      this.shippingOption$.pipe(tap(value => instance.shippingOption = value)),
      this.theme$.pipe(tap(value => instance.theme = value)),
      instance.clicked.pipe(tap(() => this.clicked.emit())),
    ).pipe(map(() => instance));
  }

  private initComponent(
    component: ComponentRef<CheckoutWidgetComponent>,
  ): Observable<CheckoutWidgetComponent> {
    return this.initProps(component).pipe(
      tap(() => {
        component.instance.cdr.markForCheck();
      }),
      takeUntil(this.destroy$),
    );
  }
}
