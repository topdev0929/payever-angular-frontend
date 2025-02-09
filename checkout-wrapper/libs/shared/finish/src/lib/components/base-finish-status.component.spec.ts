import { Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Store } from '@ngxs/store';

import { SetFlow } from '@pe/checkout/store';
import { CommonImportsTestHelper, CommonProvidersTestHelper, flowFixture } from '@pe/checkout/testing';

import { flowWithPaymentOptionsFixture } from '../test';

import { BaseFinishStatusComponent } from './base-finish-status.component';

@Component({
  selector: 'extends-base-finish-status-component',
  template: '',
})
class TestBaseFinishStatusComponent extends BaseFinishStatusComponent {
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  prepareTranslations(): void {}
}

describe('BaseFinishStatusComponent', () => {
  let component: TestBaseFinishStatusComponent;
  let fixture: ComponentFixture<TestBaseFinishStatusComponent>;

  let store: Store;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [...CommonImportsTestHelper()],
      providers: [...CommonProvidersTestHelper()],
      declarations: [TestBaseFinishStatusComponent],
    }).compileComponents();

    store = TestBed.inject(Store);
    store.dispatch(new SetFlow(flowFixture()));

    fixture = TestBed.createComponent(TestBaseFinishStatusComponent);
    component = fixture.componentInstance;
  });

  afterEach(() => {
    jest.clearAllMocks();
    fixture?.destroy();
  });

  describe('constructor', () => {
    it('should create an instance', () => {
      expect(component).toBeTruthy();
    });
  });

  describe('ngOnChanges', () => {
    const applicationNumber = 'application-number';
    const transactionLink = 'transaction-link';
    const transactionNumber = 'order-id';

    it('should prepareTranslations after applicationNumber changes', () => {
      jest.spyOn(component, 'prepareTranslations');
      fixture.componentRef.setInput('applicationNumber', applicationNumber);
      fixture.detectChanges();
      expect(component.prepareTranslations).toHaveBeenCalled();
    });
    it('should prepareTranslations after transactionLink changes', () => {
      jest.spyOn(component, 'prepareTranslations');
      fixture.componentRef.setInput('transactionLink', transactionLink);
      fixture.detectChanges();

      expect(component.prepareTranslations).toHaveBeenCalled();
    });
    it('should prepareTranslations after transactionNumber changes', () => {
      jest.spyOn(component, 'prepareTranslations');
      fixture.componentRef.setInput('transactionNumber', transactionNumber);
      fixture.detectChanges();

      expect(component.prepareTranslations).toHaveBeenCalled();
    });
    it('should update showExternalCode$ if paymentMethod need verification', (done) => {
      fixture.componentRef.setInput('flowId', 'flowId');
      store.dispatch(new SetFlow(flowWithPaymentOptionsFixture()));
      fixture.detectChanges();
      component.showExternalCode$.subscribe((show) => {
        expect(show).toBeTruthy();
        done();
      });
    });
  });
});
