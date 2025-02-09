import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { NgControl } from '@angular/forms';
import { Store } from '@ngxs/store';
import { of } from 'rxjs';

import { PaymentInquiryStorage } from '@pe/checkout/storage';
import { SetFlow } from '@pe/checkout/store';
import { CommonImportsTestHelper, CommonProvidersTestHelper, StoreHelper } from '@pe/checkout/testing';
import { PaymentTextModule } from '@pe/checkout/ui/payment-text';

import { ProductTypeEnum, RateInterface, RatesCalculationApiService, RatesCalculationService } from '../../../shared';
import { flowWithPaymentOptionsFixture } from '../../../test';

import { RatesInfoTableComponent } from './rates-info-table.component';

describe('RatesInfoTableComponent', () => {
  const storeHelper = new StoreHelper();

  let component: RatesInfoTableComponent;
  let fixture: ComponentFixture<RatesInfoTableComponent>;
  let store: Store;
  
  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [
        ...CommonImportsTestHelper(),
        PaymentTextModule,
      ],
      declarations: [
        RatesInfoTableComponent,
      ],
      providers: [
        ...CommonProvidersTestHelper(),
        PaymentInquiryStorage,
        RatesCalculationService,
        RatesCalculationApiService,
        NgControl,
      ],
    });
 
    jest.spyOn(global as any, '$localize').mockImplementation(value => value);
    storeHelper.setMockData();
    store = TestBed.inject(Store);
    store.dispatch(new SetFlow(flowWithPaymentOptionsFixture()));
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(RatesInfoTableComponent);
    component = fixture.componentInstance;
  });

  describe('Constructor method', () => {
    it('Should check if component defined.', () => {
      fixture.detectChanges();
      expect(component).toBeDefined();
    });
  });

  describe('ngOnInit', () => {
    it('should call fetchProducts', () => {
      fixture.detectChanges();
      const fetchProductsSpy = jest.spyOn(component, 'fetchProducts');
      component.ngOnInit();
      expect(fetchProductsSpy).toHaveBeenCalled();
    });
  });
  
  describe('translations', () => {
    it('should set one_month if duration equals to 1', () => {
      component.selectedRate = {
        duration: 1,
      } as RateInterface; 

      fixture.detectChanges();

      expect(component.translations.duration[0]).toEqual(':@@santander-no.duration.one_month:');
    });

    it('should set count_months if duration doesn\'t equal to 1', () => {
      component.selectedRate = {
        duration: 2,
      } as RateInterface; 

      fixture.detectChanges();

      expect(component.translations.duration[0]).toEqual(':@@santander-no.duration.count_months:');
    });
  });

  describe('fetchProducts', () => {
    it('should set selectedRate when data is fetched', fakeAsync(() => {
      fixture.detectChanges();
      const dataMock = [{
        campaignCode: '1234',
      }] as RateInterface[];
      const fetchRatesOnceSpy = jest.spyOn(component['ratesCalculationService'], 'fetchRatesOnce')
        .mockReturnValue(of(dataMock));

      component.total = 100;
      component.initialData = {
        campaignCode: '1234',
      };
      component.currency = 'USD';
      component.creditType = ProductTypeEnum.HANDLEKONTO;

      component.fetchProducts();

      tick();

      expect(fetchRatesOnceSpy).toHaveBeenCalledWith(
        component.flowId,
        component.paymentMethod,
        component.total,
        component.creditType,
      );

      fixture.whenStable();
      
      tick();

      expect(component.selectedRate).toEqual(dataMock[0]);
    }));
  });
});
