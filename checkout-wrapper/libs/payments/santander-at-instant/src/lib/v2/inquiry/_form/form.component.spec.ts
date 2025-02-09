import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NgControl } from '@angular/forms';
import { Store } from '@ngxs/store';
import { take, tap } from 'rxjs/operators';

import { PatchFormState, SetFlow } from '@pe/checkout/store';
import { CommonImportsTestHelper, CommonProvidersTestHelper, StoreHelper } from '@pe/checkout/testing';

import { flowWithPaymentOptionsFixture } from '../../../test';

import { InquiryFormComponent } from './form.component';

describe('InquiryFormComponent', () => {
  const storeHelper = new StoreHelper();

  let component: InquiryFormComponent;
  let fixture: ComponentFixture<InquiryFormComponent>;
  let store: Store;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [
        ...CommonImportsTestHelper(),
        InquiryFormComponent,
      ],
      providers: [
        ...CommonProvidersTestHelper(),
        NgControl,
      ],
    }).compileComponents();

    storeHelper.setMockData();
    store = TestBed.inject(Store);

    store.dispatch(new SetFlow(flowWithPaymentOptionsFixture()));

    createComponent();
  });

  const createComponent = () => {
    fixture = TestBed.createComponent(InquiryFormComponent);
    component = fixture.componentInstance;

    fixture.detectChanges();
  };

  describe('Constructor', () => {
    it('Should check if component defined.', () => {
      expect(component).toBeDefined();
    });
  });

  describe('formGroup', () => {
    it('should have a form with the expected controls', () => {
      const formGroup = component.formGroup;
      fixture.detectChanges();

      expect(formGroup.get('bankId')).toBeTruthy();
      expect(formGroup.get('iban')).toBeTruthy();
    });

    it('should set bankId as required', () => {
      const control = component.formGroup.get('bankId');
      control.setValue(null);

      expect(control.hasError('required')).toBeTruthy();

      control.setValue('valid-bankId');
      expect(control.hasError('required')).toBeFalsy();
    });

    it('should validate iban ibanValidator', () => {
      const control = component.formGroup.get('iban');

      control.valueChanges.pipe(
        take(1),
        tap(() => {
          expect(control.hasError('pattern')).toBeTruthy();
        })
      ).subscribe();

      control.setValue('invalid-iban');

      control.valueChanges.pipe(
        take(1),
        tap(() => {
          expect(control.hasError('pattern')).toBeFalsy();
        })
      ).subscribe();

      control.setValue('AT482011143523283932');

    });

    it('should set iban as required', () => {
      const control = component.formGroup.get('iban');
      control.enable();

      control.setValue(null);
      expect(control.hasError('required')).toBeTruthy();

      control.setValue('valid-bic');
      expect(control.hasError('required')).toBeFalsy();
    });

  });

  describe('ngOnInit', () => {
    (window as any).PayeverStatic = {
      SvgIconsLoader: {
        loadIcons: jest.fn(),
      },
    };

    it('should load icon', () => {
      const loadIcons = jest.spyOn((window as any).PayeverStatic.SvgIconsLoader, 'loadIcons');

      component.ngOnInit();

      expect(loadIcons).toBeCalledWith(['arrow-left-16'], null, null);
    });

    it('should prefill from from state', () => {
      expect(component.formGroup.get('bankId').value).toBeFalsy();
      expect(component.formGroup.get('iban').value).toBeFalsy();

      const formData = {
        bankId: '111',
        iban: 'AT522011189164513537',
      };

      store.dispatch(new PatchFormState(formData));

      createComponent();
      expect(component.formGroup.value).toEqual(formData);
    });
  });

  describe('bankSelected', () => {
    it('should change control bankId', () => {
      const bankId = '2323';
      component.bankSelected(bankId);

      expect(component.formGroup.get('bankId').value).toEqual(bankId);
    });
  });

  describe('onSubmit', () => {
    it('should call submitted when form is valid', () => {
      const emit = jest.spyOn(component.submitted, 'emit');
      const value = {
        bankId: '111',
        iban: 'AT522011189164513537',
      };

      component.formGroup.setValue(value);

      component.onSubmit();

      expect(emit).toBeCalledWith(value);
    });
  });

  describe('initialBank', () => {
    it('should return bankId', () => {
      const value = {
        bankId: '111',
        iban: 'AT522011189164513537',
      };
      store.dispatch(new PatchFormState(value));

      expect(component.initialBank).toEqual(value.bankId);
    });
  });
});
