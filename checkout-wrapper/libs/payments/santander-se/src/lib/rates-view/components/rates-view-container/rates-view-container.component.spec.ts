import { importProvidersFrom } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { Store } from '@ngxs/store';
import { MockComponent, MockModule } from 'ng-mocks';
import { of } from 'rxjs';

import { ApiService } from '@pe/checkout/api';
import { AbstractContainerComponent } from '@pe/checkout/payment';
import { RatesModule } from '@pe/checkout/rates';
import { StorageModule } from '@pe/checkout/storage';
import { FlowState, SetFlow } from '@pe/checkout/store';
import { CommonImportsTestHelper, CommonProvidersTestHelper } from '@pe/checkout/testing';



import { SantanderSeRatesModule } from '../../../rates/santander-se-rates.module';
import { flowWithPaymentOptionsFixture } from '../../../test/fixtures';
import { RatesInfoTableComponent } from '../rates-info-table/rates-info-table.component';

import { RatesViewContainerComponent } from './rates-view-container.component';




describe('santander-se-rates-view-container', () => {
  let store: Store;

  let component: RatesViewContainerComponent;
  let fixture: ComponentFixture<RatesViewContainerComponent>;


  beforeEach(() => {
    jest.spyOn(ApiService.prototype, 'getFormOptions').mockReturnValue(of({}));

    const AbstractContainerComponentSpy = jest.spyOn(
      AbstractContainerComponent.prototype, 'paymentTitle', 'get'
    ).mockReturnValue('paymentTitle');

    TestBed.configureTestingModule({
      imports: [
        ...CommonImportsTestHelper(),
        MockModule(RatesModule),
      ],
      providers: [
        ...CommonProvidersTestHelper(),
        importProvidersFrom(SantanderSeRatesModule),
        importProvidersFrom(StorageModule),
        MockComponent(RatesInfoTableComponent),
        { provide: AbstractContainerComponent, useVale: AbstractContainerComponentSpy },
      ],
      declarations: [
        RatesInfoTableComponent,
        RatesViewContainerComponent,
      ],
    });
    store = TestBed.inject(Store);
    store.dispatch(new SetFlow(flowWithPaymentOptionsFixture()));
    fixture = TestBed.createComponent(RatesViewContainerComponent);
    component = fixture.componentInstance;
  });

  const grabChild = () => {
    const ratesInfoTableEl = fixture.debugElement.query(By.directive(RatesInfoTableComponent));
    expect(ratesInfoTableEl).toBeTruthy();
    const ratesInfoTableComponent: RatesInfoTableComponent = ratesInfoTableEl.componentInstance;
    expect(ratesInfoTableComponent).toBeTruthy();
    fixture.detectChanges();

    return {
      ratesInfoTableEl,
      ratesInfoTableComponent,
    };
  };

  describe('Constructor', () => {
    it('Should create an instance', () => {
      expect(component).toBeTruthy();
    });
  });

  describe('Component', () => {
    it('should provide inputs to RatesInfoTableComponent correctly', () => {
      const { ratesInfoTableComponent } = grabChild();
      const flow = store.selectSnapshot(FlowState.flow);
      const paymentMethod = store.selectSnapshot(FlowState.paymentMethod);
      fixture.detectChanges();

      expect(ratesInfoTableComponent.flowId).toEqual(flow.id);
      expect(ratesInfoTableComponent.total).toEqual(flow.total);
      expect(ratesInfoTableComponent.paymentMethod).toEqual(paymentMethod);
      expect(ratesInfoTableComponent.currency).toEqual(flow.currency);
      expect(ratesInfoTableComponent.initialData).toEqual({});
      expect(ratesInfoTableComponent.paymentTitle).toEqual('paymentTitle');
    });
  });

});
