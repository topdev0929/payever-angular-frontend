import { Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Store } from '@ngxs/store';

import { SetFlow } from '@pe/checkout/store';
import { CommonImportsTestHelper, CommonProvidersTestHelper } from '@pe/checkout/testing';

import { flowWithPaymentOptionsFixture } from '../../../test';

import { BaseSummaryComponent } from './base-summary.component';

@Component({
  selector: '',
  template: '',
})
class TestComponent extends BaseSummaryComponent {
}

describe('BaseSummaryComponent', () => {

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

  it('should formatDate correctly', () => {
    expect(component['formatDate'](new Date(2024, 1, 1))).toEqual('01/02/2024');
  });

  it('should makeFormKey correctly', () => {
    expect(component['makeFormKey']('guarantor.netIncome')).toEqual($localize `:@@payment-santander-de-pos.inquiry.form.guarantor.netIncome.label:`);
  });

});
