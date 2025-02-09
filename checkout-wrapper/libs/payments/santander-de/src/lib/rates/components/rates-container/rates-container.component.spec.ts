import { CurrencyPipe, registerLocaleData } from '@angular/common';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import * as de from '@angular/common/locales/de';
import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { Store } from '@ngxs/store';
import { Observable } from 'rxjs';

import { DialogService } from '@pe/checkout/dialog';
import { ABSTRACT_PAYMENT_SERVICE, PaymentSubmissionService } from '@pe/checkout/payment';
import { ChooseRateComponent, KitChooseRateComponent, KitRateViewComponent } from '@pe/checkout/rates';
import { AddressStorageService, PaymentInquiryStorage } from '@pe/checkout/storage';
import { SetFlow } from '@pe/checkout/store';
import { CommonImportsTestHelper, CommonProvidersTestHelper, StoreHelper } from '@pe/checkout/testing';
import { PaymentTextModule } from '@pe/checkout/ui/payment-text';
import { LocaleConstantsService, PeCurrencyPipe } from '@pe/checkout/utils';

import {
  PaymentService,
  RatesCalculationService,
  SantanderDeApiService,
  SantanderDeFlowService,
} from '../../../shared/services';
import { flowWithPaymentOptionsFixture, rateFixture } from '../../../test';
import { FormComponent } from '../_form';
import { RatesEditListComponent } from '../rates-edit-list';
import { RatesFormComponent } from '../rates-form';
import { TermsFormComponent } from '../terms-form';

import { RatesContainerComponent } from './rates-container.component';

describe('RatesContainerComponent', () => {
  const storeHelper = new StoreHelper();
  const httpClientSpy = {
    post: jest.fn().mockReturnValue(new Observable()),
  };

  let component: RatesContainerComponent;
  let fixture: ComponentFixture<RatesContainerComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [
        ...CommonImportsTestHelper(),
        PaymentTextModule,
        HttpClientModule,
      ],
      declarations: [
        FormComponent,
        RatesEditListComponent,
        RatesFormComponent,
        ChooseRateComponent,
        KitChooseRateComponent,
        KitRateViewComponent,
        TermsFormComponent,
        RatesContainerComponent,
      ],
      providers: [
        ...CommonProvidersTestHelper(),
        RatesCalculationService,
        { provide: PaymentInquiryStorage, useValue: {} },
        {
          provide: ABSTRACT_PAYMENT_SERVICE,
          useClass: PaymentService,
        },
        AddressStorageService,
        CurrencyPipe,
        PeCurrencyPipe,
        PaymentSubmissionService,
        { provide: HttpClient, useValue: httpClientSpy },
        { provide: DialogService, useValue: {} },
        {
          provide: LocaleConstantsService,
          useValue: {
            getLang: jest.fn().mockReturnValue('de-DE'),
          },
        },
        SantanderDeFlowService,
        SantanderDeApiService,
      ],
    }).compileComponents();
    registerLocaleData(de.default);
    storeHelper.setMockData();
    const store = TestBed.inject(Store);
    store.dispatch(new SetFlow(flowWithPaymentOptionsFixture()));
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(RatesContainerComponent);
    component = fixture.componentInstance;

    fixture.detectChanges();
  });

  describe('Constructor method', () => {
    it('Should check if component defined.', () => {
      expect(component).toBeDefined();
    });
  });

  describe('ngOnInit', () => {
    it('Should emit buttonText when ngOnInit is called', () => {
      const emitSpy = jest.spyOn(component.buttonText, 'emit');
      component.ngOnInit();

      expect(emitSpy).toHaveBeenCalledWith('');
    });
  });

  describe('onSelectRate', () => {
    it('Should emit selectRate when onSelectRate is called with a rate', () => {
      const rate = rateFixture();
      const rateSummary = {
        chooseText: expect.any(String),
        totalAmount: rate.totalCreditCost,
        downPayment: 0,
      };

      const emitSpy = jest.spyOn(component.selectRate, 'emit');

      component['onSelectRate'](rateSummary);

      expect(emitSpy).toHaveBeenCalledWith(rateSummary);
    });
  });

  describe('onSubmitted', () => {
    it('Should emit continue when onSubmitted is called', () => {
      const continueSpy = jest.spyOn(component.continue, 'next');
      component['onSubmitted']();

      expect(continueSpy).toHaveBeenCalled();
    });
  });

  describe('triggerSubmit', () => {
    it('Should call triggerSubmit and emit on submit$', () => {
      const submit$ = component['submit$'];
      const nextSpy = jest.spyOn(submit$, 'next');
      component['triggerSubmit']();
      expect(nextSpy).toHaveBeenCalled();
    });
  });
});
