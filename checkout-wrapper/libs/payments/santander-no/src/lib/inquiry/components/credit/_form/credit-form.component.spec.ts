import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Store } from '@ngxs/store';

import { ExternalNavigateData } from '@pe/checkout/storage';
import { SetFlow } from '@pe/checkout/store';
import {
  CommonImportsTestHelper,
  CommonProvidersTestHelper,
  StoreHelper,
} from '@pe/checkout/testing';

import { TYPE_CREDIT_Z } from '../../../../shared';
import { flowWithPaymentOptionsFixture } from '../../../../test';

import { CreditFormComponent } from './credit-form.component';

describe('CreditFormComponent', () => {
  const storeHelper = new StoreHelper();
  let component: CreditFormComponent;
  let fixture: ComponentFixture<CreditFormComponent>;
  let store: Store;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [
        ...CommonImportsTestHelper(),
      ],
      providers: [
        ...CommonProvidersTestHelper(),
        ExternalNavigateData,
      ],
      declarations: [
        CreditFormComponent,
      ], 
    }).compileComponents();

    storeHelper.setMockData();
    store = TestBed.inject(Store);

    store.dispatch(new SetFlow(flowWithPaymentOptionsFixture()));

    fixture = TestBed.createComponent(CreditFormComponent);
    component = fixture.componentInstance;

    fixture.detectChanges();
  });

  describe('Initialization', () => {
    it('Should check if component defined.', () => {
      expect(component).toBeDefined();
    });

    it('should call externalNavigateData.extractFromUrlAndSave in ngOnInit', () => {
      const externalNavigateDataSpy = jest.spyOn(component['externalNavigateData'], 'extractFromUrlAndSave');
      component.ngOnInit();
      expect(externalNavigateDataSpy).toHaveBeenCalledWith(component['flow'].id);
    });

    it('should emit submitted event if type is TYPE_CREDIT_Z in ngOnInit', () => {
      const submittedEventSpy = jest.spyOn(component.submitted, 'emit');
      jest.spyOn(component['externalNavigateData'], 'getValue').mockReturnValue(TYPE_CREDIT_Z);
      component.ngOnInit();
      expect(submittedEventSpy).toHaveBeenCalled();
    });

    it('should not emit submitted event if type is not TYPE_CREDIT_Z in ngOnInit', () => {
      const submittedEventSpy = jest.spyOn(component.submitted, 'emit');
      jest.spyOn(component['externalNavigateData'], 'getValue').mockReturnValue('otherType');
      component.ngOnInit();
      expect(submittedEventSpy).not.toHaveBeenCalled();
    });

  });

  describe('submit', () => {
    it('should emit submitted event', () => {
      const submittedEventSpy = jest.spyOn(component.submitted, 'emit');
      component.submit();
      expect(submittedEventSpy).toHaveBeenCalled();
    });
  });
});
