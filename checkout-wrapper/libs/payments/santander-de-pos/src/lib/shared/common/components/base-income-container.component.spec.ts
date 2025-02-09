import { Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Store } from '@ngxs/store';

import { SetFlow } from '@pe/checkout/store';
import { CommonImportsTestHelper, CommonProvidersTestHelper } from '@pe/checkout/testing';

import { flowWithPaymentOptionsFixture } from '../../../test';
import { IncomeService, RatesCalculationApiService, RatesCalculationService } from '../services';

import { BaseIncomeContainerComponent } from './base-income-container.component';

@Component({
  selector: '',
  template: '',
})
class TestComponent extends BaseIncomeContainerComponent {
}

describe('BaseIncomeContainerComponent', () => {

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
        IncomeService,
        RatesCalculationService,
        RatesCalculationApiService,
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

});
