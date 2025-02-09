import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { NgControl } from '@angular/forms';
import { Store } from '@ngxs/store';

import { ChooseRateComponent, KitChooseRateComponent, RateUtilsService } from '@pe/checkout/rates';
import { PaymentInquiryStorage } from '@pe/checkout/storage';
import { SetFlow } from '@pe/checkout/store';
import { CommonImportsTestHelper, CommonProvidersTestHelper, StoreHelper } from '@pe/checkout/testing';
import { FlowExtraDurationType } from '@pe/checkout/types';
import { PaymentTextModule } from '@pe/checkout/ui/payment-text';

import { 
  ProductTypeEnum,
  RatesCalculationApiService,
  RatesCalculationService,
  SelectedInterface,
} from '../../../shared';
import { flowWithPaymentOptionsFixture } from '../../../test';
import { RatesEditListComponent } from '../rates-edit-list/rates-edit-list.component';

import { RatesFormComponent } from './rates-form.component';

describe('RatesFormComponent', () => {
  const storeHelper = new StoreHelper();

  let component: RatesFormComponent;
  let fixture: ComponentFixture<RatesFormComponent>;
  let store: Store;
  
  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [
        ...CommonImportsTestHelper(),
        PaymentTextModule,
      ],
      declarations: [
        RatesEditListComponent,
        ChooseRateComponent,
        KitChooseRateComponent,

        RatesFormComponent,
      ],
      providers: [
        ...CommonProvidersTestHelper(),
        PaymentInquiryStorage,
        RatesCalculationService,
        RatesCalculationApiService,
        RateUtilsService,
        NgControl,
      ],
    });

    storeHelper.setMockData();
    store = TestBed.inject(Store);
    store.dispatch(new SetFlow(flowWithPaymentOptionsFixture()));
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(RatesFormComponent);
    component = fixture.componentInstance;

    fixture.detectChanges();
  });

  describe('Constructor method', () => {
    it('Should check if component defined.', () => {
      expect(component).toBeDefined();
    });
  });

  describe('extraDuration Input Setter', () => {
    it('should set onlyDuration property when extraDuration input is provided', () => {
      const testDuration: FlowExtraDurationType = 10;
      
      component.extraDuration = testDuration;
  
      expect(component.onlyDuration).toEqual(testDuration);
    });
  
    it('should not modify onlyDuration property when extraDuration input is not provided', () => {
      const initialOnlyDuration = component.onlyDuration;
  
      component.extraDuration = undefined;
  
      expect(component.onlyDuration).toEqual(initialOnlyDuration);
    });
  });

  describe('submitted Output', () => {
    it('should emit valid form value when rates are not loading and no load error', fakeAsync(() => {
      const mockFormValue = {
        campaignCode: '',
        monthlyAmount: 0,
        creditType: ProductTypeEnum.STUDENTKONTO,
        socialSecurityNumber: '',
        telephoneMobile: '',
        acceptedCreditCheck: false,
      };
      const emitSpy = jest.spyOn(component['ngForm'].ngSubmit, 'emit');
      const fetchRatesSpy = jest.spyOn(component.ratesListElem, 'fetchRates');

      component.formGroup.setValue(mockFormValue);
      component.isRatesLoading = false;
      component.hasRatesLoadError = false;

      component.submitted.subscribe();
      component['submit$'].next();
      
      tick();

      expect(fetchRatesSpy).not.toHaveBeenCalled();
      expect(emitSpy).toHaveBeenCalledWith(mockFormValue);
    }));

    it('should call fetchRatesSpy when rates are loading', fakeAsync(() => {
      const fetchRatesSpy = jest.spyOn(component.ratesListElem, 'fetchRates');

      component.isRatesLoading = true;
      component.hasRatesLoadError = false;

      component.submitted.subscribe();
      component['submit$'].next();
      
      tick();

      expect(fetchRatesSpy).toHaveBeenCalled();
    }));

    it('should call fetchRatesSpy when there is a rates load error', fakeAsync(() => {
      const fetchRatesSpy = jest.spyOn(component.ratesListElem, 'fetchRates');

      component.isRatesLoading = false;
      component.hasRatesLoadError = true;

      component.submitted.subscribe();
      component['submit$'].next();

      tick();
      
      expect(fetchRatesSpy).toHaveBeenCalled();
    }));
  });

  describe('onRateSelected Method', () => {
    it('should update formGroup with selected data and emit selected rate', () => {
      const mockSelected = {
        data: {},
        rate: {},
      } as SelectedInterface;
      const patchValueSpy = jest.spyOn(component.formGroup, 'patchValue');
      const emitSpy = jest.spyOn(component.selectRate, 'next');

      component.onRateSelected(mockSelected);

      expect(patchValueSpy).toHaveBeenCalledWith(mockSelected.data);
      expect(emitSpy).toHaveBeenCalledWith(mockSelected.rate);
    });
  });
});
