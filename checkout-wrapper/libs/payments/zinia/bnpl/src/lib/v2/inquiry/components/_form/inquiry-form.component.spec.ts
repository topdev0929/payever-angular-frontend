import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Store } from '@ngxs/store';
import { MockComponents } from 'ng-mocks';
import { Subject, of, BehaviorSubject } from 'rxjs';

import { CheckoutFormsInputModule } from '@pe/checkout/forms/input';
import { NodeFlowService } from '@pe/checkout/node-api';
import { PaymentSubmissionService } from '@pe/checkout/payment';
import { PatchFormState, SetFlow } from '@pe/checkout/store';
import { CommonImportsTestHelper, CommonProvidersTestHelper, clearValidators } from '@pe/checkout/testing';
import { NodePaymentResponseInterface } from '@pe/checkout/types';


import { PromoComponent } from '../../../../shared/components';
import { flowWithPaymentOptionsFixture } from '../../../../test/fixtures';
import { ZiniaViewTerms } from '../../../models';
import { TermsService } from '../../../services';
import { DetailsFormComponent } from '../details-form';
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
          PromoComponent,
        ),
      ],
    });
    store = TestBed.inject(Store);
    store.dispatch(new SetFlow(flowWithPaymentOptionsFixture()));
    fixture = TestBed.createComponent(InquiryFormComponent);
    component = fixture.componentInstance;
    formGroup = component.formGroup;
    fixture.detectChanges();
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

  describe('component', () => {
    it('should post payment data on submit ', (done) => {
      const spy = jest.spyOn(store, 'dispatch');
      component.formGroup.patchValue({ detailsForm: { birthday: '25/8/1991' } });
      const paymentData: NodePaymentResponseInterface<null> = {
        createdAt: new Date().toString(),
        id: 'id',
        payment: null,
        paymentDetails: null,
        paymentItems: [],
      };

      jest.spyOn(TestBed.inject(NodeFlowService), 'postPayment').mockReturnValue(of(paymentData));


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
