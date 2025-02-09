import { Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ABSTRACT_PAYMENT_SERVICE } from '@pe/checkout/payment';
import { PaymentInquiryStorage } from '@pe/checkout/storage';
import { CommonImportsTestHelper, CommonProvidersTestHelper } from '@pe/checkout/testing';

import { BaseContainerComponent } from './base-container.component';

@Component({
  selector: '',
  template: '',
})
class TestComponent extends BaseContainerComponent {
}

describe('BaseContainerComponent', () => {

  let component: TestComponent;
  let fixture: ComponentFixture<BaseContainerComponent>;

  beforeEach(() => {

    TestBed.configureTestingModule({
      declarations: [TestComponent],
      imports: [
        ...CommonImportsTestHelper(),
      ],
      providers: [
        ...CommonProvidersTestHelper(),
        PaymentInquiryStorage,
        { provide: ABSTRACT_PAYMENT_SERVICE, useValue: {} },
      ],
      schemas: [],
    }).compileComponents();

    fixture = TestBed.createComponent(TestComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();

  });

  it('should be defined', () => {

    expect(component).toBeDefined();

  });

  it('should defined apiService', () => {

    expect((component as any).apiService).toBeDefined();

  });

  it('should set default value', () => {

    expect(component.errorMessage).toBeNull();
    expect(component.errors).toBeUndefined();
    expect(component.flow).toBeNull();

  });

});
