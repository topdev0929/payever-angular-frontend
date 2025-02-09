import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormGroupDirective } from '@angular/forms';
import { Store } from '@ngxs/store';
import { MockComponents } from 'ng-mocks';
import { Subject, of, BehaviorSubject } from 'rxjs';

import { CheckoutFormsInputModule } from '@pe/checkout/forms/input';
import { NodeFlowService } from '@pe/checkout/node-api';
import { PaymentSubmissionService } from '@pe/checkout/payment';
import { PatchFormState, SetFlow, FlowState } from '@pe/checkout/store';
import { CommonImportsTestHelper, CommonProvidersTestHelper, clearValidators } from '@pe/checkout/testing';
import { NodePaymentResponseInterface } from '@pe/checkout/types';


import { flowWithPaymentOptionsFixture } from '../../../../test/fixtures';
import { TermsService, ZiniaViewTerms } from '../../../shared';
import { DetailsFormComponent } from '../details-form';
import { RatesFormComponent } from '../rates-form';
import { TermsFormComponent } from '../terms-form';

import { InquiryFormComponent } from './inquiry-form.component';


describe('zinia-bnpl-inquiry-form-v2', () => {
  let component: InquiryFormComponent;
  let fixture: ComponentFixture<InquiryFormComponent>;
  let store: Store;
  let formGroup: InstanceType<typeof InquiryFormComponent>['formGroup'];
  const submit$ = new Subject<number>();
  const termsSubject = new BehaviorSubject<ZiniaViewTerms>(null);

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [
        ...CommonImportsTestHelper(),
        CheckoutFormsInputModule,
      ],
      providers: [
        ...CommonProvidersTestHelper(),
        { provide: PaymentSubmissionService, useValue: submit$ },
        {
          provide: TermsService,
          useValue: {
            getTerms: jest.fn(() => termsSubject),
          },
        },
      ],
      declarations: [
        InquiryFormComponent,
        MockComponents(
          DetailsFormComponent,
          TermsFormComponent,
          RatesFormComponent,
        ),
      ],
    });
    store = TestBed.inject(Store);
    store.dispatch(new SetFlow(flowWithPaymentOptionsFixture()));
    fixture = TestBed.createComponent(InquiryFormComponent);
    component = fixture.componentInstance;
    formGroup = component.formGroup;
  });

  afterEach(() => {
    fixture?.destroy();
    jest.clearAllMocks();
    jest.resetAllMocks();
  });

  describe('component', () => {
    const phone = '+491711234567';
    const birthDate = new Date('1/1/1991').toString();

    it('should patch form on init', () => {
      fixture.destroy();
      fixture = TestBed.createComponent(InquiryFormComponent);
      component = fixture.componentInstance;

      jest.spyOn(store, 'selectSnapshot').mockImplementation((selector: unknown) =>
        selector === FlowState.flow ? {
          ...flowWithPaymentOptionsFixture(),
          billingAddress: {
            ...flowWithPaymentOptionsFixture().billingAddress,
            phone,
          },
          apiCall: {
            ...flowWithPaymentOptionsFixture().apiCall,
            birthDate,
          },
        } : null,
      );
      const patchValue = jest.spyOn(component.formGroup, 'patchValue');
      jest.spyOn(component['dateUtilService'], 'fixDate').mockReturnValue(birthDate);

      fixture.detectChanges();
      component.ngOnInit();

      expect(patchValue).toHaveBeenCalledWith({
        detailsForm: {
          phone,
          birthday: birthDate,
        },
      });
    });

    it('should handle patch form with undefined if flow does not contain date and phone ', () => {
      const formDate = {
        detailsForm: {
          birthday: new Date(10, 10, 1980).toString(),
          phone: '+459929323',
        },
      };
      fixture.destroy();
      fixture = TestBed.createComponent(InquiryFormComponent);
      component = fixture.componentInstance;
      jest.spyOn(store, 'selectSnapshot').mockImplementation((selector: unknown) =>
        selector === FlowState.flow ? {
          ...flowWithPaymentOptionsFixture(),
          billingAddress: {
            ...flowWithPaymentOptionsFixture().billingAddress,
            phone: undefined,
          },
          apiCall: {
            ...flowWithPaymentOptionsFixture().apiCall,
            birthDate: undefined,
          },
        } : formDate,
      );
      const patchValue = jest.spyOn(component.formGroup, 'patchValue');
      jest.spyOn(component['dateUtilService'], 'fixDate').mockReturnValue(formDate.detailsForm.birthday);

      fixture.detectChanges();
      component.ngOnInit();

      expect(patchValue).toHaveBeenCalledWith({
        detailsForm: formDate.detailsForm,
      });
    });

    it('should post payment data on submit ', (done) => {
      const spy = jest.spyOn(store, 'dispatch');
      component.formGroup.patchValue({
        detailsForm: { phone, birthday: new Date(birthDate) },
      });
      component['formGroupDirective'] = {
        onSubmit: jest.fn(),
      } as unknown as FormGroupDirective;
      const paymentData: NodePaymentResponseInterface<null> = {
        createdAt: new Date().toString(),
        id: 'id',
        payment: null,
        paymentDetails: null,
        paymentItems: [],
      };

      jest.spyOn(TestBed.inject(NodeFlowService), 'postPayment').mockReturnValue(of(paymentData));

      component.ngOnInit();

      component.submitted.subscribe((v) => {
        expect(v).toEqual(formGroup.value);
        expect(spy).toHaveBeenCalledWith(new PatchFormState(formGroup.value));
        done();
      });

      clearValidators(formGroup);
      submit$.next(Date.now());
    });

    it('should get terms enable termsForm', (done) => {

      const setPaymentLoading = jest.spyOn(component['paymentHelperService'], 'setPaymentLoading');

      const terms: ZiniaViewTerms = {
        termOne: [{
          label: 'term 1',
          required: true,
          documentId: 'documentId',
        }],
      };
      termsSubject.next(terms);

      component.terms$.subscribe((terms) => {
        expect(terms).toEqual(terms);
        expect(setPaymentLoading).toHaveBeenCalledWith(false);
        expect(component.formGroup.get('termsForm').enabled).toBeTruthy();
        done();
      });

    });

    it('should get terms disable termsForm if terms not found', (done) => {

      const setPaymentLoading = jest.spyOn(component['paymentHelperService'], 'setPaymentLoading');
      termsSubject.next(null);

      component.terms$.subscribe((terms) => {
        expect(terms).toEqual(null);
        expect(setPaymentLoading).toHaveBeenCalledWith(false);
        expect(component.formGroup.get('termsForm').disabled).toBeTruthy();
        done();
      });
    });
  });
});

