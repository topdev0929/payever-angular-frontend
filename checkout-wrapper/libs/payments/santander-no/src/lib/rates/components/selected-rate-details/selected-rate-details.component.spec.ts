import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NgControl } from '@angular/forms';
import { Store } from '@ngxs/store';

import { SetFlow } from '@pe/checkout/store';
import { CommonImportsTestHelper, CommonProvidersTestHelper, StoreHelper } from '@pe/checkout/testing';
import { PaymentTextModule } from '@pe/checkout/ui/payment-text';

import { flowWithPaymentOptionsFixture } from '../../../test';

import { DetailInteface, UISelectedRateDetailsComponent } from './selected-rate-details.component';

describe('UISelectedRateDetailsComponent', () => {
  const storeHelper = new StoreHelper();

  let component: UISelectedRateDetailsComponent;
  let fixture: ComponentFixture<UISelectedRateDetailsComponent>;
  let store: Store;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [
        ...CommonImportsTestHelper(),
        PaymentTextModule,
      ],
      declarations: [
        UISelectedRateDetailsComponent,
      ],
      providers: [
        ...CommonProvidersTestHelper(),
        NgControl,
      ],
    });

    storeHelper.setMockData();
    store = TestBed.inject(Store);
    store.dispatch(new SetFlow(flowWithPaymentOptionsFixture()));
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(UISelectedRateDetailsComponent);
    component = fixture.componentInstance;

    fixture.detectChanges();
  });

  describe('Constructor method', () => {
    it('Should check if component defined.', () => {
      expect(component).toBeDefined();
    });
  });

  it('should initialize with default values', () => {
    expect(component.details).toEqual([]);
    expect(component._numColumns).toEqual(2);
    expect(component.regularTextColor).toEqual('#333333');
    expect(component.rows).toEqual([]);
    expect(component.isSmallSize).toBeFalsy();
    expect(component.numColumns).toEqual(2);
  });

  describe('ngAfterViewInit', () => {
    it('should initialize resizeSensor', () => {
      jest.spyOn(component, 'onResized');
      component.ngAfterViewInit();
      expect(component['resizeSensor']).toBeTruthy();
    });
  });

  describe('ngOnDestroy', () => {
    it('should detach resizeSensor on destroy', () => {
      jest.spyOn(component['resizeSensor'], 'detach');
      component.ngOnDestroy();
      expect(component['resizeSensor'].detach).toHaveBeenCalled();
    });
  });

  describe('ngOnChanges', () => {
    it('should update rows when details change', () => {
      const newDetails = [{
        title: 'title',
        value: 'value',
      }] as DetailInteface[];
      component['details'] = newDetails;
      component.ngOnChanges();

      expect(component.rows).toEqual([newDetails]);
    });
  });

  describe('onResized', () => {
    it('should update properties and call ngOnChanges', () => {
      jest.spyOn(component, 'ngOnChanges');
      const newWidth = 500;

      component.onResized(newWidth);

      expect(component['oldWidth']).toEqual(newWidth);
      expect(component.isSmallSize).toBeFalsy();
      expect(component.numColumns).toEqual(component._numColumns);
      expect(component.ngOnChanges).toHaveBeenCalled();
    });

    it('should set numColums 2 if isSmallSize', () => {
      component.isSmallSize = true;

      component.onResized(100);

      expect(component.isSmallSize).toBeTruthy();
      expect(component.numColumns).toEqual(2);
    });

    it('should not call ngOnChanges if width has not changed', () => {
      jest.spyOn(component, 'ngOnChanges');
      const currentWidth = 500;
      component['oldWidth'] = currentWidth;
      component.onResized(currentWidth);
      expect(component.ngOnChanges).not.toHaveBeenCalled();
    });
  });
});
