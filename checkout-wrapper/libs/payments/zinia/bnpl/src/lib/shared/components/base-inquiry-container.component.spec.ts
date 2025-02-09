import { Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Store } from '@ngxs/store';
import { cold } from 'jest-marbles';
import { ReplaySubject, of } from 'rxjs';

import { AnalyticsFormService } from '@pe/checkout/analytics';
import { ABSTRACT_PAYMENT_SERVICE } from '@pe/checkout/payment';
import { AddressStorageService, PaymentInquiryStorage } from '@pe/checkout/storage';
import {
  SetFlow,
} from '@pe/checkout/store';
import { CommonImportsTestHelper, CommonProvidersTestHelper } from '@pe/checkout/testing';
import { ThreatMetrixService } from '@pe/checkout/tmetrix';

import { flowWithPaymentOptionsFixture } from '../../test/fixtures';

import { BaseContainerComponent } from './base-container.component';
import { BaseInquiryContainerComponent } from './base-inquiry-container.component';

@Component({
  selector: 'extends-base-container-component',
  template: '',
})
class ExtendsBaseInquiryContainerComponent extends BaseInquiryContainerComponent {
  triggerSubmit = jest.fn();
}

describe('ExtendsBaseInquiryContainerComponent', () => {
  let fixture: ComponentFixture<ExtendsBaseInquiryContainerComponent>;
  let component: ExtendsBaseInquiryContainerComponent;

  let store: Store;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [
        ...CommonImportsTestHelper(),
      ],
      providers: [
        ...CommonProvidersTestHelper(),
        AddressStorageService,
        PaymentInquiryStorage,
        { provide: ABSTRACT_PAYMENT_SERVICE, useValue: {} },
      ],
    });
    fixture = TestBed.createComponent(ExtendsBaseInquiryContainerComponent);
    component = fixture.componentInstance;

    store = TestBed.inject(Store);
    store.dispatch(new SetFlow(flowWithPaymentOptionsFixture()));
    fixture.detectChanges();
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  describe('Constructor', () => {
    it('Should create an instance', () => {
      expect(component).toBeTruthy();
      expect(component instanceof BaseContainerComponent).toBeTruthy();
    });
  });

  describe('component', () => {
    it('ngOnInit', () => {
      const analyticsFormService = TestBed.inject(AnalyticsFormService);
      const initPaymentMethod = jest.spyOn(analyticsFormService, 'initPaymentMethod');
      const buttonText = jest.spyOn(component.buttonText, 'next');

      const replay$ = new ReplaySubject<{ inProgress: boolean, loaded: boolean }>();
      component.threatMetrixProcess$.subscribe(replay$);
      jest.spyOn(ThreatMetrixService.prototype, 'nodeInitFor')
        .mockReturnValue(of(true));

      component.ngOnInit();

      expect(buttonText).toHaveBeenCalled();
      expect(initPaymentMethod).toHaveBeenCalled();
      expect(replay$).toBeObservable(cold('t', { t: { inProgress: false, loaded: true } }));
    });

    it('reloadThreatMetrix', () => {
      const replay$ = new ReplaySubject<{ inProgress: boolean, loaded: boolean }>();
      component.threatMetrixProcess$.subscribe(replay$);
      jest.spyOn(ThreatMetrixService.prototype, 'nodeInitFor')
        .mockReturnValue(of(true));

      component.reloadThreatMetrix();

      expect(replay$).toBeObservable(cold('t', { t: { inProgress: false, loaded: true } }));
    });
  });
});
