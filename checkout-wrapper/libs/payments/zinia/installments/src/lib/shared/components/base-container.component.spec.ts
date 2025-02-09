import { Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Store } from '@ngxs/store';

import { ABSTRACT_PAYMENT_SERVICE, AbstractContainerComponent } from '@pe/checkout/payment';
import { AddressStorageService, PaymentInquiryStorage } from '@pe/checkout/storage';
import {
  SetFlow,
} from '@pe/checkout/store';
import { CommonImportsTestHelper, CommonProvidersTestHelper } from '@pe/checkout/testing';

import { flowWithPaymentOptionsFixture } from '../../test/fixtures';

import { BaseContainerComponent } from './base-container.component';


@Component({
  selector: 'extends-base-container-component',
  template: '',
})
class ExtendsBaseContainerComponent extends BaseContainerComponent {

}

describe('BaseContainerComponent', () => {
  let fixture: ComponentFixture<ExtendsBaseContainerComponent>;
  let component: ExtendsBaseContainerComponent;

  let store: Store;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [
        ...CommonImportsTestHelper(),
      ],
      providers: [
        ...CommonProvidersTestHelper(),
        BaseContainerComponent,
        AddressStorageService,
        PaymentInquiryStorage,
        { provide: ABSTRACT_PAYMENT_SERVICE, useValue: {} },
      ],
    });
    fixture = TestBed.createComponent(ExtendsBaseContainerComponent);
    component = fixture.componentInstance;

    store = TestBed.inject(Store);
    store.dispatch(new SetFlow(flowWithPaymentOptionsFixture()));
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  describe('Constructor', () => {
    it('Should create an instance', () => {
      expect(component).toBeTruthy();
      expect(component instanceof AbstractContainerComponent).toBeTruthy();
    });
  });
});
