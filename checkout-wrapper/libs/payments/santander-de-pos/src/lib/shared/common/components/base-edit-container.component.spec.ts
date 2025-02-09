import { Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Store } from '@ngxs/store';

import { ABSTRACT_PAYMENT_SERVICE } from '@pe/checkout/payment';
import { AddressStorageService, PaymentInquiryStorage } from '@pe/checkout/storage';
import { SetPaymentComplete, SubmitPayment, SetFlow } from '@pe/checkout/store';
import { CommonImportsTestHelper, CommonProvidersTestHelper } from '@pe/checkout/testing';

import { flowWithPaymentOptionsFixture } from '../../../test';

import { BaseEditContainerComponent } from './base-edit-container.component';

@Component({
  selector: '',
  template: '',
})
class TestComponent extends BaseEditContainerComponent {
}
describe('BaseEditContainerComponent', () => {

  let component: TestComponent;
  let fixture: ComponentFixture<TestComponent>;

  let store: Store;

  beforeEach(() => {

    TestBed.configureTestingModule({
      imports: [
        ...CommonImportsTestHelper(),
      ],
      providers: [
        ...CommonProvidersTestHelper(),
        PaymentInquiryStorage,
        AddressStorageService,
        { provide: ABSTRACT_PAYMENT_SERVICE, useValue: null },
      ],
      declarations: [
        TestComponent,
      ],
      schemas: [],
    }).compileComponents();

    store = TestBed.inject(Store);

    store.dispatch(new SetFlow(flowWithPaymentOptionsFixture()));

    fixture = TestBed.createComponent(TestComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();

  });

  afterEach(() => {
    jest.clearAllMocks();
    fixture?.destroy();
  });

  it('should create an instance', () => {
    expect(component).toBeTruthy();
  });

  it('should handle loading true', (done) => {
    component.isLoading$.subscribe((loading) => {
      expect(loading).toBeTruthy();
      done();
    });
    store.dispatch(new SubmitPayment());
  });
  it('should handle loading false', (done) => {
    component.isLoading$.subscribe((loading) => {
      expect(loading).toBeFalsy();
      done();
    });
    store.dispatch(new SetPaymentComplete());
  });

});
