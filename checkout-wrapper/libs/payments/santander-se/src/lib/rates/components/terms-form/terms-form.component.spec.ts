import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormBuilder, FormControl, NgControl } from '@angular/forms';
import { Store } from '@ngxs/store';

import { DialogModule } from '@pe/checkout/dialog';
import { PatchFormState, SetFlow } from '@pe/checkout/store';
import { CommonImportsTestHelper, CommonProvidersTestHelper } from '@pe/checkout/testing';


import {
  TermsFormValue,
} from '../../../shared';
import { flowWithPaymentOptionsFixture } from '../../../test/fixtures';

import { TermsFormComponent } from './terms-form.component';


describe('terms-form', () => {
  let component: TermsFormComponent;
  let fixture: ComponentFixture<TermsFormComponent>;
  let store: Store;
  let termsForm: FormControl<TermsFormValue>;
  let debugElement: HTMLElement;
  let formGroup: InstanceType<typeof TermsFormComponent>['formGroup'];

  beforeEach(() => {
    const fb = new FormBuilder();
    termsForm = fb.control<TermsFormValue>(null, []);

    TestBed.configureTestingModule({
      imports: [
        ...CommonImportsTestHelper(),
        DialogModule,
      ],
      providers: [
        ...CommonProvidersTestHelper(),
        {
          provide: NgControl,
          useValue: termsForm,
        },
      ],
      declarations: [
        TermsFormComponent,
      ],
    });
    store = TestBed.inject(Store);
    store.dispatch(new SetFlow(flowWithPaymentOptionsFixture()));
    fixture = TestBed.createComponent(TermsFormComponent);
    component = fixture.componentInstance;
    component.translations.acceptConditions = '<a target="_blank">link</a>';
    fixture.detectChanges();
    debugElement = fixture.debugElement.nativeElement;
    formGroup = component.formGroup;
  });

  afterEach(() => {
    fixture?.destroy();
    jest.clearAllMocks();
  });


  describe('Constructor', () => {
    it('Should create an instance', () => {
      expect(component).toBeTruthy();
    });
  });

  describe('terms-form', () => {
    it('Should require conditions to be accept', () => {
      formGroup.patchValue({ acceptConditions: false });
      expect(formGroup.valid).toBeFalsy();
      expect(formGroup.get('acceptConditions').errors).toMatchObject({ required: true });

      formGroup.patchValue({ acceptConditions: true });
      expect(formGroup.valid).toBeTruthy();
    });
    it('should open terms dialog when label is clicked', () => {
      const openSpy = jest.spyOn(component['dialogService'], 'open');
      openSpy.mockImplementation(() => null);

      store.dispatch(new PatchFormState({ ratesForm: { campaignCode: '132' } }));

      debugElement.querySelector('a').click();
      expect(openSpy).toHaveBeenCalled();
    });
  });
});

