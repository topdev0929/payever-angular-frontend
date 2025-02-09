
import { importProvidersFrom } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Store } from '@ngxs/store';
import { MockComponents, MockProvider } from 'ng-mocks';
import { of } from 'rxjs';

import { BaseWidgetCustomElementComponent, PaymentWidgetsSdkModule } from '@pe/checkout/payment-widgets';
import {
  SetFlow,
} from '@pe/checkout/store';
import {
  CommonImportsTestHelper,
  CommonProvidersTestHelper,
  QueryChildByDirective,
} from '@pe/checkout/testing';
import {
  CheckoutModeEnum,
  PaymentMethodEnum,
  RatesOrderEnum,
  WidgetTypeEnum,
} from '@pe/checkout/types';

import { flowWithPaymentOptionsFixture } from '../../../test/fixtures/flow-with-payment-options.fixture';
import { SantanderDeWidgetModule } from '../../santander-de-widget.module';
import { WidgetsApiService } from '../../services';
import { ButtonComponent } from '../button/button.component';
import { DropdownCalculatorComponent } from '../dropdown-calculator/dropdown-calculator.component';
import { TextComponent } from '../text/text.component';
import { TwoFieldsCalculatorComponent } from '../two-fields-calculator/two-fields-calculator.component';

import { SantanderDeCustomElementComponent } from './custom-element.component';


describe('widget-santander-de-custom-element', () => {
  let store: Store;

  let component: SantanderDeCustomElementComponent;
  let fixture: ComponentFixture<SantanderDeCustomElementComponent>;


  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [
        ...CommonImportsTestHelper(),
        PaymentWidgetsSdkModule,
      ],
      providers: [
        importProvidersFrom(SantanderDeWidgetModule),
        ...CommonProvidersTestHelper(),
        MockProvider(WidgetsApiService, {
          getRates: () => of({
            currency: 'EUR',
            rates: [
              {
                amount: 50049.5,
                annualPercentageRate: 1,
                duration: 6,
                interest: 1,
                interestRate: 2,
                lastMonthPayment: 8338.54,
                monthlyPayment: 8343.54,
                specificData: {
                  firstInstallment: 8342.8,
                  processingFee: 25,
                  rsvTotal: 3,
                },
                totalCreditCost: 50049.5,
              },
            ],
          }),
        }),
      ],
      declarations: [
        MockComponents(
          ButtonComponent,
          TextComponent,
          DropdownCalculatorComponent,
          TwoFieldsCalculatorComponent,
        ),
        SantanderDeCustomElementComponent,
      ],
    });
    store = TestBed.inject(Store);
    store.dispatch(new SetFlow(flowWithPaymentOptionsFixture()));
    fixture = TestBed.createComponent(SantanderDeCustomElementComponent);
    component = fixture.componentInstance;
  });


  const initComponent = () => {
    fixture.componentRef.setInput('config', {
      ratesOrder: RatesOrderEnum.Asc,
      payments: [
        {
          paymentMethod: PaymentMethodEnum.SANTANDER_INSTALLMENT,
        },
      ],
      checkoutMode: CheckoutModeEnum.FinanceExpress,
    });
    fixture.detectChanges();
  };

  afterEach(() => {
    fixture?.destroy();
    jest.clearAllMocks();
  });

  describe('Constructor', () => {
    it('Should create an instance', () => {
      initComponent();
      expect(component).toBeTruthy();
      expect(component instanceof BaseWidgetCustomElementComponent).toBeTruthy();
    });
    describe('component', () => {
      it('widget-santander-de-button I/O', () => {
        fixture.componentRef.setInput('type', WidgetTypeEnum.Button);
        initComponent();
        const { child: btnComponent } = QueryChildByDirective(fixture, ButtonComponent);
        expect(btnComponent.config).toMatchObject(component.config);
        expect(btnComponent.channelSet).toEqual(component.channelSet);
        expect(btnComponent.amount).toEqual(component.amount);

        const clicked = jest.spyOn(component.clicked, 'emit');
        btnComponent.clickedEmitter.emit();
        expect(clicked).toBeCalled();

        const onFailed = jest.spyOn(BaseWidgetCustomElementComponent.prototype, 'onFailed');
        btnComponent.failedEmitter.emit();
        expect(onFailed).toBeCalled();
      });

      it('widget-santander-de-dropdown-calculator I/O', () => {
        fixture.componentRef.setInput('type', WidgetTypeEnum.DropdownCalculator);
        initComponent();
        const { child: btnComponent } = QueryChildByDirective(fixture, DropdownCalculatorComponent);
        expect(btnComponent.config).toMatchObject(component.config);
        expect(btnComponent.channelSet).toEqual(component.channelSet);
        expect(btnComponent.amount).toEqual(component.amount);

        const clicked = jest.spyOn(component.clicked, 'emit');
        btnComponent.clickedEmitter.emit();
        expect(clicked).toBeCalled();

        const onFailed = jest.spyOn(BaseWidgetCustomElementComponent.prototype, 'onFailed');
        btnComponent.failedEmitter.emit();
        expect(onFailed).toBeCalled();
      });

      it('widget-santander-de-text I/O', () => {
        fixture.componentRef.setInput('type', WidgetTypeEnum.Text);
        initComponent();
        const { child: btnComponent } = QueryChildByDirective(fixture, TextComponent);
        expect(btnComponent.config).toMatchObject(component.config);
        expect(btnComponent.channelSet).toEqual(component.channelSet);
        expect(btnComponent.amount).toEqual(component.amount);

        const clicked = jest.spyOn(component.clicked, 'emit');
        btnComponent.clickedEmitter.emit();
        expect(clicked).toBeCalled();

        const onFailed = jest.spyOn(BaseWidgetCustomElementComponent.prototype, 'onFailed');
        btnComponent.failedEmitter.emit();
        expect(onFailed).toBeCalled();
      });

      it('widget-santander-de-two-fields-calculator I/O', () => {
        fixture.componentRef.setInput('type', WidgetTypeEnum.TwoFieldsCalculator);
        initComponent();
        const { child: btnComponent } = QueryChildByDirective(fixture, TwoFieldsCalculatorComponent);
        expect(btnComponent.config).toMatchObject(component.config);
        expect(btnComponent.channelSet).toEqual(component.channelSet);
        expect(btnComponent.amount).toEqual(component.amount);

        const clicked = jest.spyOn(component.clicked, 'emit');
        btnComponent.clickedEmitter.emit();
        expect(clicked).toBeCalled();

        const onFailed = jest.spyOn(BaseWidgetCustomElementComponent.prototype, 'onFailed');
        btnComponent.failedEmitter.emit();
        expect(onFailed).toBeCalled();
      });
    });
  });
});

