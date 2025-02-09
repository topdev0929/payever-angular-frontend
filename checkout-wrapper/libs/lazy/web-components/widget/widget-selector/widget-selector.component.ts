import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  ElementRef,
  EventEmitter,
  Injector,
  Input,
  OnInit,
  Output,
  ViewChild,
  ViewContainerRef,
  createNgModule,
} from '@angular/core';
import { BehaviorSubject, merge, ReplaySubject } from 'rxjs';
import { takeUntil, tap } from 'rxjs/operators';

import { BaseWidgetCustomElementComponent } from '@pe/checkout/payment-widgets';
import {
  AddressInterface,
  CustomWidgetConfigInterface,
  PaymentItem,
  PaymentMethodEnum,
  PaymentWidgetEnum,
  ShippingOption,
  WidgetTypeEnum,
} from '@pe/checkout/types';
import { AbstractComponent, EnvironmentConfigInterface } from '@pe/common';

import { WIDGET_SELECTOR_TYPES } from './selector-config';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'widget-main-selector',
  template: '<ng-template #container></ng-template>',
})
export class WidgetSelectorComponent extends AbstractComponent implements OnInit {
  private readonly channelSet$ = new BehaviorSubject<string>(null);
  @Input() set channelSet(value: string) {
    this.channelSet$.next(value);
  }

  private readonly type$ = new BehaviorSubject<WidgetTypeEnum>(null);
  @Input() set type(value: WidgetTypeEnum) {
    this.type$.next(value);
  }

  private readonly amount$ = new BehaviorSubject<number>(null);
  @Input() set amount(value: number) {
    this.amount$.next(value);
  }

  private readonly isDebugMode$ = new BehaviorSubject<boolean>(null);
  @Input() set isDebugMode(value: boolean) {
    this.isDebugMode$.next(value);
  }

  private readonly env$ = new BehaviorSubject<EnvironmentConfigInterface>(null);
  @Input() set env(value: EnvironmentConfigInterface) {
    this.env$.next(value);
  }

  private readonly paymentMethod$ = new BehaviorSubject<PaymentWidgetEnum>(null);
  @Input() set paymentMethod(value: PaymentWidgetEnum) {
    this.paymentMethod$.next(value);
  }

  private readonly config$ = new BehaviorSubject<CustomWidgetConfigInterface>(null);
  @Input() set config(value: CustomWidgetConfigInterface) {
    this.config$.next(value);
  }

  private readonly cart$ = new ReplaySubject<PaymentItem[]>(1);
  @Input() set cart(value: PaymentItem[]) {
    this.cart$.next(value);
  }

  private readonly billingAddress$ = new ReplaySubject<AddressInterface>(1);
  @Input() set billingAddress(value: AddressInterface) {
    this.billingAddress$.next(value);
  }

  private readonly shippingAddress$ = new ReplaySubject<AddressInterface>(1);
  @Input() set shippingAddress(value: AddressInterface) {
    this.shippingAddress$.next(value);
  }

  private readonly shippingOption$ = new ReplaySubject<ShippingOption>(1);
  @Input() set shippingOption(value: ShippingOption) {
    this.shippingOption$.next(value);
  }

  private readonly theme$ = new ReplaySubject<'light' | 'dark'>(1);
  @Input() set theme(value: 'light' | 'dark') {
    this.theme$.next(value);
  }

  @Output() clicked = new EventEmitter<void>();

  @ViewChild('container', { read: ViewContainerRef, static: true }) containerRef: ViewContainerRef;

  constructor(private injector: Injector, private cdr: ChangeDetectorRef, private elementRef: ElementRef) {
    super();
  }

  ngOnInit(): void {
    this.paymentMethod$
      .pipe(
        tap(paymentMethod => this.loadWidget(paymentMethod)),
        takeUntil(this.destroyed$)
      )
      .subscribe();
  }

  loadWidget(paymentMethod: PaymentWidgetEnum): void {
    if (paymentMethod in WIDGET_SELECTOR_TYPES) {
      WIDGET_SELECTOR_TYPES[paymentMethod].import().then((module) => {
        this.containerRef.clear();
        const factory = createNgModule(module, this.injector);
        const componentType = factory.instance.resolveComponent();
        const component = this.containerRef.createComponent(componentType, {
          injector: factory.injector,
        });
        this.initBaseInputsOutputs(component.instance);

        this.cdr.detectChanges();
      });
    } else {
      throw new Error(`Invalid widget\n${JSON.stringify(paymentMethod)}`);
    }
  }

  private initBaseInputsOutputs(instance: BaseWidgetCustomElementComponent) {
    instance.shadowRoot = this.elementRef.nativeElement.shadowRoot;

    merge(
      this.channelSet$.pipe(tap(value => (instance.channelSet = value))),
      this.amount$.pipe(tap(value => (instance.amount = value))),
      this.type$.pipe(tap(value => (instance.type = value))),
      this.isDebugMode$.pipe(tap(value => (instance.isDebugMode = value))),
      this.config$.pipe(tap(value => (instance.config = value))),
      this.env$.pipe(tap(value => (instance.env = value))),
      this.cart$.pipe(tap(value => (instance.cart = value))),
      this.theme$.pipe(tap(value => (instance.setTheme = value))),
      this.paymentMethod$.pipe(tap(value => (instance.paymentMethod = value as unknown as PaymentMethodEnum))),
      instance.clicked.pipe(tap(() => this.clicked.emit()))
    )
      .pipe(
        tap(() => {
          instance.cdr.detectChanges();
        }),
        takeUntil(this.destroyed$)
      )
      .subscribe();
  }
}
