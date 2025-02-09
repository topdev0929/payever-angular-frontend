import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NgControl } from '@angular/forms';
import { Store } from '@ngxs/store';

import { PatchFormState, SetFlow } from '@pe/checkout/store';
import { CommonImportsTestHelper, CommonProvidersTestHelper, StoreHelper } from '@pe/checkout/testing';

import { flowWithPaymentOptionsFixture } from '../../../../test';

import { DetailsFormComponent } from './details-form.component';

describe('DetailsFormComponent', () => {
  const storeHelper = new StoreHelper();

  let component: DetailsFormComponent;
  let fixture: ComponentFixture<DetailsFormComponent>;
  let store: Store;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [
        ...CommonImportsTestHelper(),
      ],
      providers: [
        ...CommonProvidersTestHelper(),
        NgControl,
      ],
      declarations: [
        DetailsFormComponent,
      ],
    }).compileComponents();
  });

  beforeEach(() => {
    storeHelper.setMockData();
    store = TestBed.inject(Store);
    store.dispatch(new SetFlow(flowWithPaymentOptionsFixture()));

    fixture = TestBed.createComponent(DetailsFormComponent);
    component = fixture.componentInstance;
  });

  describe('Constructor', () => {
    it('Should create component instance', () => {
      expect(component).toBeDefined();
    });
  });

  describe('Form Initialization', () => {
    it('should create the form with the expected controls', () => {
      fixture.detectChanges();

      expect(component.formGroup.get('socialSecurityNumber')).toBeDefined();
      expect(component.formGroup.get('registeredPostNumber')).toBeDefined();
      expect(component.formGroup.get('telephoneMobile')).toBeDefined();
    });
  });


  describe('ngOnInit', () => {
    it('should dispatch a PatchFormState action on form value changes', () => {
      const data = {
        registeredPostNumber: '',
        socialSecurityNumber: '',
        telephoneMobile: '',
      };
      const dispatchSpy = jest.spyOn(store, 'dispatch');

      fixture.detectChanges();

      component.formGroup.setValue(data);

      expect(dispatchSpy).toHaveBeenCalledWith(new PatchFormState({ formDetails: data }));
    });
  });
});
